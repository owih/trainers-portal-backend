const roles = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  TRAINER: 'TRAINER',
  ATHLETE: 'ATHLETE',
  PARENT: 'PARENT',
};

const rolesToCreate = [roles.ATHLETE, roles.PARENT, roles.TRAINER];
const rolesWithCreatePermission = [roles.ADMIN, roles.MODERATOR];
const rolesWithDeletePermission = [roles.ADMIN, roles.MODERATOR];
const rolesWithUpdatePermission = [roles.ADMIN, roles.MODERATOR];
const rolesAsModeration = [roles.ADMIN, roles.MODERATOR];
const rolesWithProfiles = [roles.TRAINER];

module.exports = {
  roles,
  rolesToCreate,
  rolesWithCreatePermission,
  rolesWithDeletePermission,
  rolesWithUpdatePermission,
  rolesAsModeration,
  rolesWithProfiles,
};
