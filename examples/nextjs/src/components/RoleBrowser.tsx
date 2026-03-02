'use client';

import { useState, useEffect } from 'react';
import { roleStore } from '@/access/roles';
import { useUser } from '@/context/UserContext';

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 'var(--space-xs) var(--space-sm)',
  borderBottom: '2px solid var(--color-border)',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--color-text-muted)',
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-xs) var(--space-sm)',
  borderBottom: '1px solid var(--color-border)',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-sm)',
  alignItems: 'center',
  marginBottom: 'var(--space-lg)',
  flexWrap: 'wrap',
};

const dangerBtnStyle: React.CSSProperties = {
  background: 'var(--color-danger)',
  color: '#fff',
};

const gatedStyle: React.CSSProperties = {
  padding: 'var(--space-lg)',
  textAlign: 'center',
  color: 'var(--color-text-muted)',
};

const AVAILABLE_ROLES = ['admin', 'editor', 'author', 'viewer'];

interface Assignment {
  userId: string;
  roles: string[];
}

export function RoleBrowser() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [userId, setUserId] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { can } = useUser();

  const isAdmin = can('delete');

  const refresh = async () => {
    const list = await roleStore.listAssignments();
    setAssignments(list);
  };

  useEffect(() => {
    roleStore.listAssignments().then(setAssignments);
  }, []);

  if (!isAdmin) {
    return (
      <div style={gatedStyle}>
        <h1>Roles</h1>
        <p>Admin access required to manage role assignments.</p>
      </div>
    );
  }

  const handleToggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleAssign = async () => {
    const trimmed = userId.trim();
    if (!trimmed || selectedRoles.length === 0) return;
    await roleStore.setRoles(trimmed, selectedRoles);
    setUserId('');
    setSelectedRoles([]);
    await refresh();
  };

  const handleRemove = async (id: string) => {
    await roleStore.setRoles(id, []);
    await refresh();
  };

  return (
    <div>
      <h1>Roles</h1>

      <div style={formStyle}>
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ minWidth: 200 }}
        />
        {AVAILABLE_ROLES.map((role) => (
          <label
            key={role}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <input
              type="checkbox"
              checked={selectedRoles.includes(role)}
              onChange={() => handleToggleRole(role)}
            />
            {role}
          </label>
        ))}
        <button onClick={handleAssign}>Assign</button>
      </div>

      {assignments.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>
          No role assignments yet.
        </p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>User ID</th>
              <th style={thStyle}>Roles</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.userId}>
                <td style={tdStyle}>{a.userId}</td>
                <td style={tdStyle}>{a.roles.join(', ')}</td>
                <td style={tdStyle}>
                  <button
                    style={dangerBtnStyle}
                    onClick={() => handleRemove(a.userId)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
