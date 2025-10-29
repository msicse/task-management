import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import PrimaryButton from "@/Components/PrimaryButton";
import {
    UserGroupIcon,
    TagIcon,
    PlusIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";

export default function RoleCategories({ auth, roles, categories }) {
    const [rolesData, setRolesData] = useState(roles || []);
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categorySearch, setCategorySearch] = useState("");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [fullAccess, setFullAccess] = useState([]);

    const [processing, setProcessing] = useState(false);

    const addSelectedCategoriesToRole = async () => {
        if (!selectedRole || selectedCategories.length === 0) return;

        setProcessing(true);
        try {
            // Add categories one by one
            for (const categoryId of selectedCategories) {
                const response = await fetch(route('admin.role-categories.add'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    },
                    body: JSON.stringify({
                        role_id: selectedRole,
                        category_id: categoryId
                    })
                });

                if (!response.ok) {
                    throw new Error(`Failed to add category ${categoryId}`);
                }
            }

            // Refresh the page to show updated data
            window.location.reload();
        } catch (error) {
            alert('Error adding categories. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const removeCategoryFromRole = async (roleId, categoryId) => {
        setProcessing(true);
        try {
            const response = await fetch(route('admin.role-categories.remove'), {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    role_id: roleId,
                    category_id: categoryId
                })
            });

            if (response.ok) {
                const result = await response.json();
                // Update roles data
                setRolesData(prevRoles =>
                    prevRoles.map(role =>
                        role.id === roleId ? result.role : role
                    )
                );
            }
        } catch (error) {
        } finally {
            setProcessing(false);
        }
    };

    const getRoleCategories = (roleId) => {
        const role = rolesData.find(r => r.id === roleId);
        return role ? role.categories : [];
    };

    const getRoleCategoryNames = (roleId) => {
        const categoryIds = getRoleCategories(roleId);
        return categoryIds.map(categoryId => {
            const category = categories.find(cat => cat.id === categoryId);
            return category ? category.name : `Category ${categoryId}`;
        });
    };

    const getAvailableCategories = () => {
        if (!selectedRole) return categories;
        const roleCategories = getRoleCategories(parseInt(selectedRole));
        return categories.filter(cat => !roleCategories.includes(cat.id));
    };

    const toggleFullAccess = (roleName) => {
        setFullAccess(prev => {
            if (prev.includes(roleName)) {
                return prev.filter(name => name !== roleName);
            } else {
                return [...prev, roleName];
            }
        });
    };

    const getFilteredCategories = () => {
        const availableCategories = getAvailableCategories();
        return availableCategories.filter(category =>
            category.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
    };

    const toggleCategorySelection = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    const removeCategoryFromSelection = (categoryId) => {
        setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    };

    const getSelectedCategoryNames = () => {
        return selectedCategories.map(id => {
            const category = categories.find(cat => cat.id === id);
            return category ? category.name : `Category ${id}`;
        });
    };

    const saveChanges = async () => {
        setProcessing(true);
        try {
            // Helper function to check if role has all categories
            const hasFullAccess = (role) => {
                const roleCategories = getRoleCategories(role.id);
                return roleCategories.length === categories.length &&
                       categories.every(cat => roleCategories.includes(cat.id));
            };

            let changesMade = false;

            // Batch process all role changes in parallel for maximum speed
            const roleUpdates = roles.map(async (role) => {
                const isMarkedForFullAccess = fullAccess.includes(role.name);
                const currentlyHasFullAccess = hasFullAccess(role);

                // Only make changes if the state doesn't match
                if (isMarkedForFullAccess && !currentlyHasFullAccess) {
                    // Grant full access - add only missing categories
                    const currentCategories = getRoleCategories(role.id);
                    const missingCategories = categories.filter(cat => !currentCategories.includes(cat.id));

                    if (missingCategories.length > 0) {
                        await addCategoriesToRole(role, missingCategories.map(cat => cat.id));
                        return true; // Change made
                    } else {
                        return false; // No change needed
                    }
                } else if (!isMarkedForFullAccess && currentlyHasFullAccess) {
                    // Remove full access - remove all categories
                    await assignCategoriesToRole(role, []);
                    return true; // Change made
                } else {
                    return false; // No change needed
                }
            });

            // Wait for all role updates to complete in parallel
            const results = await Promise.all(roleUpdates);
            changesMade = results.some(changed => changed);

            if (changesMade) {
                alert('Changes saved successfully!');
                // Reload the page to reflect changes
                window.location.reload();
            } else {
                alert('No changes were needed - all roles already match their selected state.');
            }
        } catch (error) {
            alert(`Error saving changes: ${error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const addCategoriesToRole = async (role, categoryIds) => {
        // Get current categories and merge with new ones for a single API call
        const currentCategories = getRoleCategories(role.id);
        const allCategories = [...new Set([...currentCategories, ...categoryIds])]; // Remove duplicates



        // Use the assign endpoint with the merged list (more efficient than individual adds)
        await assignCategoriesToRole(role, allCategories);
    };

    const assignCategoriesToRole = async (role, categoryIds) => {
        // This replaces all categories (used for removing full access)
        const requestData = {
            role_id: role.id,
            category_ids: categoryIds
        };
        // Get CSRF token from meta tag
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

        // Assign categories to this role
        const response = await fetch(route('admin.role-categories.assign'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update categories for ${role.name}: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        return result;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Role Category Management
                    </h2>
                </div>
            }
        >
            <Head title="Role Category Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Information Section */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <div className="flex items-start">
                            <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 mt-1" />
                            <div>
                                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                                    Role-Based Category Access
                                </h3>
                                <p className="text-blue-700 dark:text-blue-300 mb-2">
                                    Configure which activity categories each role can access. Users will only see categories assigned to their roles.
                                </p>
                                <ul className="text-sm text-blue-600 dark:text-blue-400 list-disc list-inside space-y-1">
                                    <li><strong>Full Access Roles:</strong> Can see all categories regardless of individual assignments</li>
                                    <li><strong>Individual Categories:</strong> Specific categories assigned to each role</li>
                                    <li><strong>Multiple Roles:</strong> Users with multiple roles see combined categories from all their roles</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Add Category to Role Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-visible shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Add Category to Role
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Role
                                    </label>
                                    <select
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200"
                                    >
                                        <option value="">Choose a role...</option>
                                        {rolesData.map(role => (
                                            <option key={role.id} value={role.id}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Select Categories (Multi-Select)
                                    </label>

                                    {/* Selected Categories Display */}
                                    {selectedCategories.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {getSelectedCategoryNames().map((categoryName, index) => (
                                                <span
                                                    key={selectedCategories[index]}
                                                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                                                >
                                                    {categoryName}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCategoryFromSelection(selectedCategories[index])}
                                                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Search Input */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search and select categories..."
                                            value={categorySearch}
                                            onChange={(e) => setCategorySearch(e.target.value)}
                                            onFocus={() => setShowCategoryDropdown(true)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-200"
                                            disabled={!selectedRole}
                                        />

                                        {/* Dropdown */}
                                        {showCategoryDropdown && selectedRole && (
                                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                {getFilteredCategories().length > 0 ? (
                                                    getFilteredCategories().map(category => (
                                                        <div
                                                            key={category.id}
                                                            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center justify-between ${
                                                                selectedCategories.includes(category.id)
                                                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                                    : 'text-gray-900 dark:text-gray-200'
                                                            }`}
                                                            onClick={() => toggleCategorySelection(category.id)}
                                                        >
                                                            <span>{category.name}</span>
                                                            {selectedCategories.includes(category.id) && (
                                                                <CheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-2 text-gray-500 dark:text-gray-400 italic">
                                                        No categories found
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Click outside to close (scoped to this block, not full screen) */}
                                    {showCategoryDropdown && (
                                        <div
                                            className="absolute inset-0 z-40"
                                            onClick={() => setShowCategoryDropdown(false)}
                                        />
                                    )}
                                </div>

                                <div>
                                    <button
                                        onClick={addSelectedCategoriesToRole}
                                        disabled={!selectedRole || selectedCategories.length === 0 || processing}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        {processing ? 'Adding...' : `Add ${selectedCategories.length} ${selectedCategories.length === 1 ? 'Category' : 'Categories'}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role Mappings Display */}
                    <div>
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Current Role-Category Mappings
                                    </h3>
                                    <PrimaryButton onClick={saveChanges} disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </PrimaryButton>
                                </div>

                                <div className="space-y-6">
                                    {roles.map(role => (
                                        <div key={role.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center">
                                                    <UserGroupIcon className="w-5 h-5 text-gray-400 mr-2" />
                                                    <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                                                        {role.name}
                                                    </h4>
                                                </div>

                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={fullAccess.includes(role.name)}
                                                        onChange={() => toggleFullAccess(role.name)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                                        Full Access (All Categories)
                                                    </span>
                                                </label>
                                            </div>

                                            {fullAccess.includes(role.name) ? (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                                                    <div className="flex items-center">
                                                        <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400 mr-2" />
                                                        <span className="text-sm text-green-800 dark:text-green-200">
                                                            This role has access to all categories
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {getRoleCategories(role.id).length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {getRoleCategoryNames(role.id).map((categoryName, index) => {
                                                                const categoryId = getRoleCategories(role.id)[index];
                                                                return (
                                                                <div
                                                                    key={`${role.id}-${categoryId}`}
                                                                    className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                                                                >
                                                                    <TagIcon className="w-3 h-3 mr-1" />
                                                                    {categoryName}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeCategoryFromRole(role.id, categoryId)}
                                                                        className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                                                    >
                                                                        <TrashIcon className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                                                            No categories assigned to this role
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Summary
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                        {roles.length}
                                    </div>
                                    <div className="text-sm text-blue-800 dark:text-blue-200">
                                        Total Roles
                                    </div>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {categories.length}
                                    </div>
                                    <div className="text-sm text-green-800 dark:text-green-200">
                                        Total Categories
                                    </div>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {fullAccess.length}
                                    </div>
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        Full Access Roles
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
