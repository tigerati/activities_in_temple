import React, { useEffect, useState } from 'react';
import { Table, Container } from 'react-bootstrap';

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/users')  // Adjust endpoint
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <Container className="my-5">
      <h2>All Users</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Email</th><th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id}>
              <td>{idx + 1}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default UserList;
