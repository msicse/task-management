import TaskForm2 from "./Partials/TaskForm2";
import { useForm, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import TaskForm3 from "./Partials/TaskForm3";

export default function Create({ auth, users, categories }) {
    const { data, setData, post, errors } = useForm({
        name: "",
        status: "",
        description: "",
        due_date: "",
        assigned_user_id: "",
        factory_id: "",
        category_id: "",
        priority: "",
    });

    const onSubmit = (e) => {
        e.preventDefault();
        post(route("tasks.store"));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Create Task
                </h2>
            }
        >
            <Head title="Create Task" />

            <div className="py-2">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <TaskForm3
                                data={data}
                                setData={setData}
                                errors={errors}
                                onSubmit={onSubmit}
                                users={users}
                                categories={categories}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
