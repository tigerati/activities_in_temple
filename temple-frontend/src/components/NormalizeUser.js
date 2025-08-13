function normalizeUser(payload) {
  const u = payload?.user || payload || {};
  // split full_name if first/last missing
  let first_name = u.first_name, last_name = u.last_name;
  if (!first_name && !last_name && u.full_name) {
    const parts = String(u.full_name).trim().split(/\s+/);
    first_name = parts.shift() || '';
    last_name = parts.join(' ') || '';
  }
  return {
    first_name,
    last_name,
    email: u.email ?? '',
    phone: u.phone ?? '',
    address: u.address ?? '',
    id_number: u.id_number ?? '',
    birthdate: u.birthdate ?? '',
    created_at: u.created_at ?? u.createdAt ?? '',
    profile_image_url: u.profile_image_url ?? u.profileImageUrl ?? '',
  };
}

export default normalizeUser;