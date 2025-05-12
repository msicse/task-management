<?php

use App\Http\Controllers\TaskController;

// Simple test to verify our permission implementation exists
test('task controller has permission map defined', function() {
    $controller = new TaskController();
    $reflection = new ReflectionClass($controller);
    $property = $reflection->getProperty('permissionMap');
    $property->setAccessible(true);
    $permissionMap = $property->getValue($controller);

    // Check that permission map has entries for common methods
    expect(array_key_exists('index', $permissionMap))->toBeTrue();
    expect(array_key_exists('create', $permissionMap))->toBeTrue();
    expect(array_key_exists('store', $permissionMap))->toBeTrue();
    expect(array_key_exists('show', $permissionMap))->toBeTrue();
    expect(array_key_exists('edit', $permissionMap))->toBeTrue();
    expect(array_key_exists('update', $permissionMap))->toBeTrue();
    expect(array_key_exists('destroy', $permissionMap))->toBeTrue();
    expect(array_key_exists('updateTaskDetails', $permissionMap))->toBeTrue();
    expect(array_key_exists('myTasks', $permissionMap))->toBeTrue();

    // Verify specific permissions
    expect($permissionMap['index'])->toBe('task-list');
    expect($permissionMap['create'])->toBe('task-create');
    expect($permissionMap['show'])->toBe('task-view');
    expect($permissionMap['myTasks'])->toBe('task-view-own');
    expect($permissionMap['updateTaskDetails'])->toBe('task-complete|task-approve');
});
