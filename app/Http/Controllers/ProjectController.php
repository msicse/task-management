<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Http\Resources\TaskResource;
use Illuminate\Auth\Events\Validated;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\ProjectResource;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Project::query();

        $shortField = request("short_field", 'created_at');
        $shortDirection = request("short_direction", 'desc');

        if(request("name")){
            $query->where("name","like","%".request("name")."%");
        }
        if(request("status")){
            $query->where("status", request("status"));
        }
        $projects = $query->orderBy($shortField, $shortDirection)->paginate(10)->onEachSide(1);
        return inertia("Project/Index", [
            'projects' => ProjectResource::collection($projects),
            'queryParams' => request()->query() ?: null,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia("Project/Create");
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();
        $image = $data['image'] ?? null;
        $data['created_by'] = Auth::user()->id;
        $data['updated_by'] = Auth::user()->id;
        if($image){
            $data['image_path'] = $image->store('project/'.Str::random(), 'public');
        }
        $project = Project::create($data);

        return to_route("projects.index")->with("success", ("Project is created"));
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        $query = $project->tasks();
        $shortField = request("short_field", 'created_at');
        $shortDirection = request("short_direction", 'desc');

        if(request("name")){
            $query->where("name","like","%".request("name")."%");
        }
        if(request("status")){
            $query->where("status", request("status"));
        }

        $tasks = $query->orderBy($shortField, $shortDirection)->paginate(10)->onEachSide(1);
        return inertia('Project/Show',[
            'project' => new ProjectResource($project),
            'tasks' => TaskResource::collection($tasks),
            'queryParams' => request()->query() ?: null,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        return inertia("Project/Edit", [
            "project" => new ProjectResource($project),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();
        $image = $data['image'] ?? null;
        $data['updated_by'] = Auth::user()->id;

        if($project->image_path){
            Storage::disk('public')->deleteDirectory(dirname($project->image_path));
        }
        if($image){
            $data['image_path'] = $image->store('project/'.Str::random(), 'public');
        }
        $project->update($data);

        return to_route("projects.index")->with("success", ("Project \"$project->name\" is updated"));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $name = $project->name;
        if($project->image_path){
            Storage::disk("public")->deleteDirectory(dirname($project->image_path));
        }
        $project->delete();
        return to_route('projects.index')->with('success', ("Project \"$name\" was deleted"));
    }
}
