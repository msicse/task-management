/**
 * Utility functions for handling permissions on the client side
 */

/**
 * Check if a user has a specific permission
 * @param {Object} user - The authenticated user object
 * @param {String} permission - The permission to check for
 * @returns {Boolean} - Whether the user has the permission
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;

  // Check direct permissions (if they exist on the user object)
  const hasDirectPermission =
    Array.isArray(user.permissions) && user.permissions.includes(permission);

  // Check role-based permissions
  const hasRolePermission =
    Array.isArray(user.roles) &&
    user.roles.some((role) =>
      Array.isArray(role.permissions) &&
      role.permissions.some((p) => p.name === permission)
    );

  return hasDirectPermission || hasRolePermission;
};

/**
 * Check if a user has any of the specified permissions
 * @param {Object} user - The authenticated user object
 * @param {String|Array} permissions - Single permission string or array of permissions
 * @returns {Boolean} - Whether the user has any of the permissions
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user) return false;

  // Convert string to array if needed (for 'permission1|permission2' format)
  if (typeof permissions === 'string') {
    permissions = permissions.split('|');
  }

  // Check each permission
  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user is the creator of a resource
 * @param {Object} user - The authenticated user
 * @param {Object} resource - The resource object with created_by property
 * @returns {Boolean} - Whether user is the creator
 */
export const isCreator = (user, resource) => {
  if (!user || !resource) return false;

  // Support both created_by and createdBy formats
  const creatorId = resource.created_by ||
    (resource.createdBy ? resource.createdBy.id || resource.createdBy : null);

  return user.id === creatorId;
};

/**
 * Check if user is the assignee of a task
 * @param {Object} user - The authenticated user
 * @param {Object} task - The task object
 * @returns {Boolean} - Whether user is assigned to the task
 */
export const isAssigned = (user, task) => {
  if (!user || !task) return false;
  return user.id === task.assigned_user_id;
};

/**
 * Check if user has a specific role
 * @param {Object} user - The authenticated user
 * @param {String} roleName - The name of the role to check for
 * @returns {Boolean} - Whether user has the specified role
 */
export const hasRole = (user, roleName) => {
  if (!user || !user.roles) return false;
  return Array.isArray(user.roles) && user.roles.some(role => role.name === roleName);
};

/**
 * Check if user can perform action on a task based on ownership and permissions
 * @param {Object} user - The authenticated user
 * @param {Object} task - The task object
 * @param {String} action - The action to check: 'view', 'edit', 'delete', 'approve', 'complete'
 * @returns {Boolean} - Whether user can perform the action
 */
export const canPerformTaskAction = (user, task, action) => {
  if (!user || !task) return false;

  // Always allow if user has direct permission without ownership restriction
  if (hasPermission(user, `task-${action}`)) {
    return true;
  }

  // Check own task permissions
  switch (action) {
    case 'view':
      return hasPermission(user, 'task-view-own') &&
        (isCreator(user, task) || isAssigned(user, task));
    case 'edit':
      return hasPermission(user, 'task-edit-own') &&
        isCreator(user, task);
    case 'delete':
      return hasPermission(user, 'task-delete-own') &&
        isCreator(user, task);
    case 'approve':
      // Allow approval if the user has task-approve permission (and is creator) OR has task-approve-all permission
      return (hasPermission(user, 'task-approve') && isCreator(user, task)) || hasPermission(user, 'task-approve-all');
    case 'complete':
      return hasPermission(user, 'task-complete') &&
        isAssigned(user, task);
    default:
      return false;
  }
};
