'use strict';

/**
 * Serializa un usuario sin exponer nunca la contraseña.
 */
function serializeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function serializeUsers(users) {
  return users.map(serializeUser);
}

module.exports = { serializeUser, serializeUsers };
