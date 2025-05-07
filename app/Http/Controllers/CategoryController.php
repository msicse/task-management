<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = Category::query();

        $sortField = request("sort_field", 'created_at');
        $sortDirection = request("sort_direction", 'desc');
        $perPage = request('per_page', 10); // Add per_page parameter with default of 10

        if (request("name")) {
            $query->where("name", "like", "%" . request("name") . "%");
        }

        // Update pagination to match TaskController approach
        $categories = $query->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->withQueryString()
            ->onEachSide(2);

        // Fix for pagination not showing with fewer records than per_page
        // Ensure that we always have pagination metadata even with few records
        $categories->setPath(request()->url());

        // Format paginated data consistently
        $paginatedCategories = $categories->through(function ($category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at,
                'tasks_count' => $category->tasks()->count(),
            ];
        });

        // Get paginated data with metadata
        $formattedData = [
            'data' => $paginatedCategories->items(),
            'links' => $categories->links()->toHtml(),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'from' => $categories->firstItem(),
                'last_page' => $categories->lastPage(),
                'path' => $categories->path(),
                'per_page' => $categories->perPage(),
                'to' => $categories->lastItem(),
                'total' => $categories->total(),
            ],
        ];

        return inertia("Categories/Index", [
            "categories" => $formattedData,
            'queryParams' => request()->only(['name', 'sort_field', 'sort_direction', 'per_page']),
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return inertia("Categories/Create", [
            'success' => session('success'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CategoryRequest $request)
    {
        Category::create($request->validated());

        return redirect()->route('categories.index')
            ->with('success', 'Category created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load('tasks');

        return inertia("Categories/Show", [
            "category" => $category,
            'success' => session('success'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        return inertia("Categories/Edit", [
            "category" => $category,
            'success' => session('success'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(CategoryRequest $request, Category $category)
    {
        $category->update($request->validated());

        return redirect()->route('categories.index')
            ->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        if ($category->tasks()->count() > 0) {
            return redirect()->route('categories.index')
                ->with('error', 'Cannot delete category. It has associated tasks.');
        }

        $category->delete();

        return redirect()->route('categories.index')
            ->with('success', 'Category deleted successfully.');
    }
}
