# Permission Management - Single Source of Truth

## 📋 Overview
All permissions and role assignments are managed in **ONE place**: `config/permissions.php`

## 🎯 How to Add a New Permission

### Step 1: Add Permission to Config
Open `config/permissions.php` and add your new permission to the appropriate section:

```php
'permissions' => [
    // ... existing permissions ...
    
    // =====================================================================
    // ACTIVITY PERMISSIONS
    // =====================================================================
    'activity-list',
    'activity-create',
    'activity-create-manual',  // ← Example: New permission added here
    // ... other permissions ...
],
```

### Step 2: Assign to Roles
In the same file, scroll down to `role_permissions` and add the permission to appropriate roles:

```php
'role_permissions' => [
    'Admin' => 'all', // Gets all permissions automatically
    
    'Manager' => [
        // ... existing permissions ...
        'activity-create-manual',  // ← Add here
    ],
    
    'Employee' => [
        // ... existing permissions ...
        'activity-create-manual',  // ← And here if needed
    ],
],
```

### Step 3: Run the Seeder
```bash
php artisan db:seed --class=PermissionsSeeder
```

### Step 4: Verify
```bash
php artisan permission:show
```

## ✅ That's It!
No need to edit multiple files or remember complex permission structures. Everything is in one place!

## 🔒 Using Permissions in Code

### In Controllers:
```php
if (!auth()->user()->can('activity-create-manual')) {
    abort(403);
}
```

### In Routes:
```php
Route::get('/activities-manual/create', [ActivityController::class, 'createManual'])
    ->middleware('permission:activity-create-manual');
```

### In Blade/Inertia:
```php
// Controller
return Inertia::render('Activities/Index', [
    'permissions' => [
        'canCreateManual' => auth()->user()->can('activity-create-manual'),
    ]
]);
```

```jsx
// React Component
{permissions.canCreateManual && (
    <button>Add Manual Activity</button>
)}
```

## 📝 Permission Naming Convention
Use kebab-case with hyphens: `module-action-modifier`

Examples:
- `activity-create` - Create regular activities
- `activity-create-manual` - Create manual activities
- `activity-list` - List own activities
- `activity-list-all` - List all users' activities
- `task-approve` - Approve tasks
- `user-edit` - Edit users

## 🗂️ Files Involved

1. **`config/permissions.php`** - ⭐ SINGLE SOURCE OF TRUTH
2. **`database/seeders/PermissionsSeeder.php`** - Reads from config and creates permissions/roles
3. **`database/seeders/CompletePermissionSeeder.php`** - ⚠️ DEPRECATED - Do not use

## 🔄 Migration Note

The old `CompletePermissionSeeder.php` is still in the codebase but should NOT be used going forward. 
All future permission management should happen through `config/permissions.php`.
