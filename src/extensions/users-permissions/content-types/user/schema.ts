export default {
  kind: 'collectionType',
  collectionName: 'up_users',
  info: {
    name: 'user',
    description: '',
    singularName: 'user',
    pluralName: 'users',
    displayName: 'User',
  },
  options: {
    draftAndPublish: false,
  },
  attributes: {
    provider: {
      type: 'string',
    },
    password: {
      type: 'password',
      minLength: 6,
      private: true,
      searchable: false,
    },
    resetPasswordToken: {
      type: 'string',
      private: true,
      searchable: false,
    },
    confirmationToken: {
      type: 'string',
      private: true,
      searchable: false,
    },
    confirmed: {
      type: 'boolean',
      default: false,
    },
    blocked: {
      type: 'boolean',
      default: false,
    },
    role: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.role',
      inversedBy: 'users',
      configurable: false,
    },
  },
}; 