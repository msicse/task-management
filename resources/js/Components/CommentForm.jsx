import { useForm } from "@inertiajs/react";
import InputError from "@/Components/InputError";
import TextareaInput from "@/Components/TextareaInput";
import PrimaryButton from "@/Components/PrimaryButton";

export default function CommentForm({ taskId, parentId = null }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        content: "",
        task_id: taskId,
        parent_id: parentId,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("comments.store"), {
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => {
                reset("content");
            },
        });
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div>
                <TextareaInput
                    value={data.content}
                    onChange={(e) => setData("content", e.target.value)}
                    placeholder="Write your comment..."
                    className="w-full"
                    rows={3}
                />
                <InputError message={errors.content} className="mt-2" />
            </div>
            <div className="flex justify-end">
                <PrimaryButton disabled={processing}>
                    {processing ? "Posting..." : "Post Comment"}
                </PrimaryButton>
            </div>
        </form>
    );
}
