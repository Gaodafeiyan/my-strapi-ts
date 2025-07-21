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
    diamondId: {
      type: 'string',
      unique: true,
      required: true,
      minLength: 9,
      maxLength: 9,
    },
    referralCode: {
      type: 'string',
      unique: true,
      required: true,
      minLength: 9,
      maxLength: 9,
    },
    invitedBy: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::users-permissions.user',
      inversedBy: 'invitedUsers',
    },
    invitedUsers: {
      type: 'relation',
      relation: 'oneToMany',
      target: 'plugin::users-permissions.user',
      mappedBy: 'invitedBy',
    },
  },
}; 