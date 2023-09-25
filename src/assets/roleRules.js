const roles = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  TRAINER: 'TRAINER',
  ATHLETE: 'ATHLETE',
  PARENT: 'PARENT',
};

const rolesToRegistration = [roles.ATHLETE, roles.PARENT];

const rolesToCreate = [roles.ATHLETE, roles.PARENT, roles.TRAINER, roles.TRAINER];

module.exports = {
  roles,
  rolesToRegistration,
  rolesToCreate,
};
