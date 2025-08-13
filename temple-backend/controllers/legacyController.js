const pool = require('../config/db');

const cleanDigits = (s) => String(s || "").replace(/\D/g, "");
const isFullName = (s) => s.trim().split(/\s+/).filter(Boolean).length >= 2;

exports.checkLegacyMemberExists = async (req, res) => {
  const rawQ = (req.body?.q || "").trim();
  if (!rawQ) return res.status(400).json({ message: "q is required" });
  if (rawQ.length > 100) return res.status(400).json({ message: "query too long" });

  const digits = cleanDigits(rawQ);
  const byDigits = digits.length >= 6;

  try {
    let exists = false;

    if (byDigits) {
      const r = await pool.query(
        `SELECT 1
           FROM legacy_members
          WHERE regexp_replace(COALESCE(mem_idcard,''), '\D','','g') = $1
             OR regexp_replace(COALESCE(mem_phone,''), '\D','','g') = $1
          LIMIT 1`,
        [digits]
      );
      exists = r.rowCount > 0;
    } else if (isFullName(rawQ)) {
      const [first, ...rest] = rawQ.replace(/\s+/g, " ").split(" ");
      const last = rest.join(" ");
      const r = await pool.query(
        `SELECT 1
           FROM legacy_members
          WHERE mem_fname ILIKE $1 AND mem_lname ILIKE $2
          LIMIT 1`,
        [first, last]
      );
      exists = r.rowCount > 0;
    } else {
      return res.status(400).json({
        message: "กรุณากรอก ชื่อ-นามสกุล หรือ หมายเลขบัตร/โทรศัพท์ (อย่างน้อย 6 หลัก)",
      });
    }

    return res.json({ exists });
  } catch (e) {
    console.error("checkLegacyMemberExists:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAllLegacyMembers = async (req, res) => {
  try {
    const limit  = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const offset = Math.max(parseInt(req.query.offset || '0',   10), 0);
    const dir    = (String(req.query.sortDir || 'asc').toLowerCase() === 'desc') ? 'DESC' : 'ASC';

    const allowedSort = {
      mem_id: 'mem_id_num',
      birthdate: 'birthdate',
    };
    const sortExpr = allowedSort[req.query.sortKey] || 'mem_id_num';

    const { rows } = await pool.query(
      `
      SELECT id, mem_id, prefix, prefix_oth, mem_fname, mem_lname,
              mem_email, mem_phone, mem_province, mem_amphur,
              mem_idcard, birthdate, note,
              COUNT(*) OVER() AS total_count
        FROM legacy_members
       ORDER BY ${sortExpr} ${dir} NULLS LAST, mem_id ${dir}
       LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );
    const total = rows[0]?.total_count || 0;
    res.json({ count: rows.length, total, matches: rows });
  } catch (err) {
    console.error('getAllLegacyMembers:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.registerLegacyMemberPublic = async (req, res) => {
  try {
    const b = req.body || {};
    const phoneDigits = cleanDigits(b.mem_phone);
    const idcardNorm = (() => {
      const d = cleanDigits(b.mem_idcard);
      return /^\d{13}$/.test(d) ? d : String(b.mem_idcard || '').toUpperCase().replace(/\s+/g,'');
    })();

    if (!b.mem_fname || !b.mem_lname)
      return res.status(400).json({ message: 'กรอกชื่อ-นามสกุล' });
    if (!phoneDigits || phoneDigits.length < 9)
      return res.status(400).json({ message: 'เบอร์โทรไม่ถูกต้อง' });
    if (!idcardNorm)
      return res.status(400).json({ message: 'ต้องระบุเลขบัตร/พาสปอร์ต' });

    const toNull = (v) => (typeof v === 'string' ? v.trim() : v) || null;

    const sql = `INSERT INTO legacy_members (
        mem_id, prefix, prefix_oth, mem_fname, mem_lname, mem_gender,
        mem_province, mem_amphur,
        address1, address2, address3, address4, address5, address6,
        postcode, mem_phone, mem_email, mem_education, mem_occupation,
        birthdate, mem_idcard, zoomdetail
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      ) RETURNING id`;

    const params = [
      toNull(b.mem_id), toNull(b.prefix), toNull(b.prefix_oth),
      toNull(b.mem_fname), toNull(b.mem_lname), toNull(b.mem_gender),
      toNull(b.mem_province), toNull(b.mem_amphur),
      toNull(b.address1), toNull(b.address2), toNull(b.address3),
      toNull(b.address4), toNull(b.address5), toNull(b.address6),
      toNull(b.postcode), phoneDigits || null, toNull(b.mem_email),
      toNull(b.mem_education), toNull(b.mem_occupation),
      toNull(b.birthdate), idcardNorm || null, toNull(b.zoomdetail)
    ];

    const r = await pool.query(sql, params);
    return res.status(201).json({ message: 'ลงทะเบียนสำเร็จ', id: r.rows[0].id });
  } catch (err) {
    console.error('registerLegacyMemberPublic:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.lookupLegacyMemberAdmin = async (req, res) => {
  const rawQ = (req.query.q || '').trim();
  if (!rawQ) return res.status(400).json({ message: 'q is required' });

  const limit  = Math.min(parseInt(req.query.limit  || '100', 10), 500);
  const offset = Math.max(parseInt(req.query.offset || '0',   10), 0);
  const dir    = (String(req.query.sortDir || 'asc').toLowerCase() === 'desc') ? 'DESC' : 'ASC';

  const MEM_ID_SORT = 'mem_id_num'; // your numeric sort column
  const allowedSort = {
    mem_id: MEM_ID_SORT,
    birthdate: 'birthdate'
  };
  const sortExpr = allowedSort[req.query.sortKey] || MEM_ID_SORT;

  const digits = String(rawQ).replace(/\D/g, '');
  const searchById = digits.length >= 6;

  try {
    let rows;
    if (searchById) {
      rows = (await pool.query(
        `
        SELECT id, mem_id, prefix, prefix_oth, mem_fname, mem_lname,
               mem_email, mem_phone, mem_province, mem_amphur,
               mem_idcard, birthdate, note,
               COUNT(*) OVER() AS total_count
          FROM legacy_members
         WHERE regexp_replace(COALESCE(mem_idcard,''), '\\D','','g') = $1
         ORDER BY ${sortExpr} ${dir} NULLS LAST, id ${dir}
         LIMIT $2 OFFSET $3
        `,
        [digits, limit, offset]
      )).rows;
    } else {
      const q = rawQ.replace(/\s+/g, ' ');
      rows = (await pool.query(
        `
        SELECT id, mem_id, prefix, prefix_oth, mem_fname, mem_lname,
               mem_email, mem_phone, mem_province, mem_amphur,
               mem_idcard, birthdate, note,
               COUNT(*) OVER() AS total_count
          FROM legacy_members
         WHERE (
           mem_fname ILIKE '%'||$1||'%' OR mem_lname ILIKE '%'||$1||'%'
           OR (COALESCE(mem_fname,'') || ' ' || COALESCE(mem_lname,'')) ILIKE '%'||$1||'%'
           OR (COALESCE(mem_lname,'') || ' ' || COALESCE(mem_fname,'')) ILIKE '%'||$1||'%'
         )
         ORDER BY ${sortExpr} ${dir} NULLS LAST, id ${dir}
         LIMIT $2 OFFSET $3
        `,
        [q, limit, offset]
      )).rows;
    }

    const total = rows[0]?.total_count || 0;
    res.json({ count: rows.length, total, matches: rows });
  } catch (e) {
    console.error('lookupLegacyMemberAdmin:', e);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateLegacyMemberNote = async (req, res) => {
  const { identifier } = req.params;           // was mem_id
  const { note } = req.body ?? {};

  try {
    // 1) try by mem_id
    let r = await pool.query(
      `UPDATE legacy_members SET note = $1 WHERE mem_id = $2 RETURNING id`,
      [note ?? "", identifier]
    );

    // 2) if none and identifier looks numeric, try by id
    if (r.rowCount === 0 && /^\d+$/.test(identifier)) {
      r = await pool.query(
        `UPDATE legacy_members SET note = $1 WHERE id = $2 RETURNING id`,
        [note ?? "", Number(identifier)]
      );
    }

    if (r.rowCount === 0) return res.status(404).json({ message: "ไม่พบสมาชิกนี้" });
    res.json({ ok: true });
  } catch (err) {
    console.error("updateLegacyMemberNote:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateLegacyMemberMemId = async (req, res) => {
  const { identifier } = req.params;
  let { mem_id } = req.body || {};

  // Normalize/validate: allow digits or simple text like '100123' or 'MEM00123'
  mem_id = String(mem_id || "").trim();
  if (!mem_id) return res.status(400).json({ message: "กรอกรหัสสมาชิก" });
  if (mem_id.length > 32) return res.status(400).json({ message: "รหัสยาวเกินไป" });

  try {
    // 1) Check duplicate
    const dup = await pool.query(`SELECT 1 FROM legacy_members WHERE mem_id = $1 LIMIT 1`, [mem_id]);
    if (dup.rowCount > 0) {
      return res.status(409).json({ message: "รหัสสมาชิกนี้ถูกใช้แล้ว" });
    }

    // 2) Update by mem_id first; if not found and identifier is numeric, update by id
    let r = await pool.query(
      `UPDATE legacy_members SET mem_id = $1 WHERE mem_id = $2 RETURNING id, mem_id`,
      [mem_id, identifier]
    );

    if (r.rowCount === 0 && /^\d+$/.test(identifier)) {
      r = await pool.query(
        `UPDATE legacy_members SET mem_id = $1 WHERE id = $2 RETURNING id, mem_id`,
        [mem_id, Number(identifier)]
      );
    }

    if (r.rowCount === 0) return res.status(404).json({ message: "ไม่พบสมาชิกนี้" });

    return res.json({ ok: true, mem_id: r.rows[0].mem_id });
  } catch (err) {
    console.error("updateLegacyMemberMemId:", err);
    // FK/unique violation safety
    if (err.code === "23505") {
      return res.status(409).json({ message: "รหัสสมาชิกซ้ำ" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};


exports.deleteLegacyMember = async (req, res) => {
  const { identifier } = req.params;

  try {
    // 1) try by mem_id
    let r = await pool.query(
      `DELETE FROM legacy_members WHERE mem_id = $1 RETURNING id`,
      [identifier]
    );

    // 2) fallback: by id if numeric
    if (r.rowCount === 0 && /^\d+$/.test(identifier)) {
      r = await pool.query(
        `DELETE FROM legacy_members WHERE id = $1 RETURNING id`,
        [Number(identifier)]
      );
    }

    if (r.rowCount === 0) return res.status(404).json({ message: "ไม่พบสมาชิกนี้" });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ message: "ลบไม่ได้ มีข้อมูลเชื่อมโยงอยู่" });
    }
    console.error("deleteLegacyMember:", err);
    res.status(500).json({ message: "Server error" });
  }
};