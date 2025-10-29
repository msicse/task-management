<?php

use App\Models\Activity;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('non-admin cannot access edit page for another user activity', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();

    $activity = Activity::factory()->create(['user_id' => $owner->id]);

    $response = $this->actingAs($other)->get(route('activities.edit', $activity));

    $response->assertRedirect(route('activities.index'));
    $response->assertSessionHas('error');
});

test('admin can access edit page for any activity', function () {
    Role::create(['name' => 'Admin']);
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $activity = Activity::factory()->create();

    $response = $this->actingAs($admin)->get(route('activities.edit', $activity));

    $response->assertOk();
});

test('non-owner cannot upload files to another user activity (json)', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $activity = Activity::factory()->create(['user_id' => $owner->id]);

    $file = UploadedFile::fake()->create('doc.pdf', 100);

    $response = $this->actingAs($other)
        ->post(route('activity-files.store', $activity), ['file' => $file], ['Accept' => 'application/json']);

    $response->assertStatus(403);
});

test('admin can upload file to any activity', function () {
    Role::create(['name' => 'Admin']);
    $admin = User::factory()->create();
    $admin->assignRole('Admin');

    $activity = Activity::factory()->create();

    $file = UploadedFile::fake()->create('doc.pdf', 100);

    $response = $this->actingAs($admin)
        ->post(route('activity-files.store', $activity), ['file' => $file], ['Accept' => 'application/json']);

    // Expect not a 403; either 201 or redirect. Assert it's successful (2xx or 3xx)
    $this->assertTrue(in_array($response->getStatusCode(), [200,201,302]));
});
