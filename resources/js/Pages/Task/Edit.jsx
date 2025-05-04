import TaskForm3 from "./Partials/TaskForm3";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Edit({ auth, users, categories, task }) {
    // Ensure users is properly structured with a data property
    const formattedUsers = { data: Array.isArray(users) ? users : users?.data || [] };

    const { data, setData, post, errors } = useForm({
        name: task.name || "",
        status: task.status || "",
        description: task.description || "",
        due_date: task.due_date || "",
        assigned_user_id: task.assigned_user_id || "",
        factory_id: task.factory_id || "",
        category_id: task.category_id || "",
        priority: task.priority || "",
        image: "",
        _method: "PUT",
    });

    const onSubmit = (e) => {
        e.preventDefault();
        post(route("tasks.update", task.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Edit Task
                </h2>
            }
        >
            <Head title="Edit Task" />

            <div className="py-2">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            <TaskForm3
                                data={data}
                                setData={setData}
                                errors={errors}
                                onSubmit={onSubmit}
                                users={formattedUsers}
                                categories={categories}
                                formType="Update"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
