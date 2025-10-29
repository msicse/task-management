<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ActivityCategory extends Model
{
    protected $fillable = [
        'name',
        'code',
        'parent_id',
        'department_id',
        'standard_time',
        'definition',
        'reference_protocol',
        'objective'
    ];

    /**
     * Boot method for auto-generating codes
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            // If this is a sub-category and no department is specified, inherit from parent
            if ($category->parent_id && !$category->department_id) {
                $parent = self::find($category->parent_id);
                if ($parent && $parent->department_id) {
                    $category->department_id = $parent->department_id;
                }
            }

            if (empty($category->code)) {
                $category->code = self::generateUniqueCode($category);
            }
        });
    }

    /**
     * Department relationship
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Department::class);
    }

    /**
     * Work roles that can access this category
     */
    public function workRoles(): BelongsToMany
    {
        return $this->belongsToMany(WorkRole::class, 'work_role_categories');
    }

    /**
     * Activities under this category
     */
    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class, 'activity_category_id');
    }

    /**
     * Parent category relationship
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(ActivityCategory::class, 'parent_id');
    }

    /**
     * Child categories relationship
     */
    public function children(): HasMany
    {
        return $this->hasMany(ActivityCategory::class, 'parent_id');
    }

    /**
     * Auto-generate unique code based on department and category name
     */
    public static function generateUniqueCode($category)
    {
        // Get department short_name from department relationship
        $deptCode = 'GEN'; // Default fallback

        // Check for temporary department object first (for preview)
        if (isset($category->department) && is_object($category->department)) {
            if (!empty($category->department->short_name)) {
                $deptCode = $category->department->short_name;
            }
        } elseif (!empty($category->department_id)) {
            try {
                $department = \App\Models\Department::find($category->department_id);
                if ($department && !empty($department->short_name)) {
                    $deptCode = $department->short_name;
                }
            } catch (\Exception $e) {
                \Log::warning('Failed to find department for code generation', [
                    'department_id' => $category->department_id,
                    'error' => $e->getMessage()
                ]);
            }
        } elseif ($category->parent_id) {
            // If no department but has parent, try to inherit from parent
            try {
                $parent = self::find($category->parent_id);
                if ($parent && $parent->department_id) {
                    $department = \App\Models\Department::find($parent->department_id);
                    if ($department && !empty($department->short_name)) {
                        $deptCode = $department->short_name;
                    }
                }
            } catch (\Exception $e) {
                \Log::warning('Failed to inherit department from parent for code generation', [
                    'parent_id' => $category->parent_id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Extract area code from category name
        $areaCode = self::extractAreaCode($category->name ?? '');

        // Get next sequence number
        try {
            $sequence = self::getNextSequence($category->parent_id, $category->department_id);
        } catch (\Exception $e) {
            $sequence = 1; // Default sequence
            \Log::warning('Failed to get sequence number', ['error' => $e->getMessage()]);
        }

        // Generate base code - Original Design
        if ($category->parent_id) {
            // Sub-category: PARENT_CODE_001 format (with sequence numbers)
            try {
                $parent = self::find($category->parent_id);
                if ($parent && !empty($parent->code)) {
                    // Use parent's base code + sequence number
                    $baseCode = "{$parent->code}_" . str_pad($sequence, 3, '0', STR_PAD_LEFT);
                } else {
                    // Fallback if parent not found - should not normally happen
                    \Log::warning('Parent category not found during code generation', [
                        'parent_id' => $category->parent_id,
                        'category_name' => $category->name ?? 'unknown'
                    ]);
                    $baseCode = "{$deptCode}_{$areaCode}_" . str_pad($sequence, 3, '0', STR_PAD_LEFT);
                }
            } catch (\Exception $e) {
                \Log::error('Error finding parent category during code generation', [
                    'parent_id' => $category->parent_id,
                    'error' => $e->getMessage()
                ]);
                $baseCode = "{$deptCode}_{$areaCode}_" . str_pad($sequence, 3, '0', STR_PAD_LEFT);
            }
        } else {
            // Main category: DEPT_AREA format (clean, no numbers)
            $baseCode = "{$deptCode}_{$areaCode}";
        }

        // Ensure uniqueness
        $code = $baseCode;
        $counter = 1;
        try {
            while (self::where('code', $code)->exists()) {
                $code = $baseCode . '_' . str_pad($counter, 2, '0', STR_PAD_LEFT);
                $counter++;

                // Prevent infinite loops
                if ($counter > 99) {
                    $code = $baseCode . '_' . time();
                    break;
                }
            }
        } catch (\Exception $e) {
            // If database check fails, add timestamp for uniqueness
            $code = $baseCode . '_' . time();
            \Log::warning('Failed to check code uniqueness', ['error' => $e->getMessage()]);
        }

        return $code;
    }

    /**
     * Extract area code from category name using enhanced pattern recognition
     */
    private static function extractAreaCode($name)
    {
        // Handle empty or null names
        if (empty($name)) {
            return 'MISC';
        }

        $name = strtolower(trim($name));

        // Enhanced patterns with more specific matching and context awareness
        $specificPatterns = [
            // Project Management variations
            'project.*management.*system' => 'PMS',
            'project.*management.*service' => 'PMSERV',
            'project.*management.*office' => 'PMO',
            'project.*planning.*management' => 'PPM',

            // Quality variations
            'quality.*assurance.*system' => 'QAS',
            'quality.*control.*management' => 'QCM',
            'quality.*management.*system' => 'QMS',

            // Documentation variations
            'document.*management.*system' => 'DMS',
            'document.*control.*system' => 'DCS',
            'technical.*documentation' => 'TECHDOC',

            // Inspection variations
            'inspection.*scheduling.*system' => 'ISS',
            'inspection.*management.*system' => 'IMS',
            'pre.*inspection.*survey' => 'PREINS',

            // Safety variations
            'safety.*management.*system' => 'SMS',
            'occupational.*safety.*health' => 'OSH',
            'fire.*safety.*system' => 'FSS',
            'electrical.*safety' => 'ELSAFE',
            'structural.*safety' => 'STRSAFE',

            // Boiler variations
            'boiler.*safety.*engineering' => 'BSE',
            'boiler.*inspection.*system' => 'BIS',
            'boiler.*management' => 'BMGMT',

            // Communication variations
            'stakeholder.*engagement' => 'STAKE',
            'communication.*management' => 'COMMGMT',
            'customer.*engagement' => 'CUSTENG',

            // Training variations
            'training.*coordination' => 'TCOORD',
            'training.*management' => 'TMGMT',
            'capacity.*building' => 'CAPBLD',

            // Compliance & Legal
            'compliance.*management' => 'CMPL',
            'regulatory.*compliance' => 'REGCMPL',
            'legal.*compliance' => 'LEGCMPL',

            // Escalation & Issues
            'escalation.*management' => 'ESCMGT',
            'issue.*management' => 'ISSMGT',
            'corrective.*action.*plan' => 'CAP',

            // Finance & Accounts
            'finance.*management' => 'FINMGT',
            'budget.*management' => 'BUDMGT',
            'accounts.*management' => 'ACCMGT',

            // Remediation specific
            'remediation.*programme' => 'REMPROG',
            'closure.*relocation' => 'CLOSREL',
            'factory.*handover' => 'FACTHO',
        ];

        // Check specific patterns first (more detailed matches)
        foreach ($specificPatterns as $pattern => $code) {
            if (preg_match('/' . $pattern . '/', $name)) {
                return $code;
            }
        }

        // Fallback to general patterns
        $generalPatterns = [
            'project.*management|^pm$' => 'PM',
            'quality.*assurance|^qa$' => 'QA',
            'test|testing' => 'TST',
            'develop|development' => 'DEV',
            'plan|planning' => 'PLN',
            'design|designing' => 'DES',
            'document|documentation' => 'DOC',
            'inspect|inspection' => 'INSP',
            'maintain|maintenance|repair' => 'MAINT',
            'schedule|scheduling' => 'SCHED',
            'report|reporting|analysis' => 'REPORT',
            'audit|auditing|review' => 'AUDIT',
            'boiler|heating|furnace' => 'BOILER',
            'phone|call|communication' => 'COMM',
            'follow|followup|tracking' => 'FOLLOW',
            'confirmation|confirm|verify' => 'CONF',
            'safety|secure|security' => 'SAFE',
            'training|train' => 'TRAIN',
            'finance|financial' => 'FIN',
            'manage|management' => 'MGT'
        ];

        foreach ($generalPatterns as $pattern => $code) {
            if (preg_match('/(' . $pattern . ')/', $name)) {
                return $code;
            }
        }

        // Smart fallback: Create meaningful abbreviation
        $words = preg_split('/[\s\-_]+/', $name);
        $abbreviation = '';

        // Take first letter of each significant word (skip common words)
        $skipWords = ['and', 'or', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by'];
        foreach ($words as $word) {
            $cleanWord = preg_replace('/[^a-z]/', '', strtolower($word));
            if (strlen($cleanWord) > 2 && !in_array($cleanWord, $skipWords)) {
                $abbreviation .= strtoupper($cleanWord[0]);
                if (strlen($abbreviation) >= 5) break;
            }
        }

        // If abbreviation is too short, pad with more letters from first word
        if (strlen($abbreviation) < 3 && !empty($words)) {
            $firstWord = preg_replace('/[^a-z]/', '', strtolower($words[0]));
            $abbreviation = strtoupper(substr($firstWord, 0, max(3, 6 - strlen($abbreviation)))) . $abbreviation;
        }

        return !empty($abbreviation) ? substr($abbreviation, 0, 6) : 'MISC';
    }

    /**
     * Get next sequence number for categories
     */
    private static function getNextSequence($parentId = null, $departmentId = null)
    {
        $query = self::query();

        if ($parentId) {
            // For subcategories, count within same parent
            $query->where('parent_id', $parentId);
        } else {
            // For main categories, count within same department
            $query->whereNull('parent_id');
            if ($departmentId) {
                $query->where('department_id', $departmentId);
            }
        }

        return $query->count() + 1;
    }

    /**
     * Get department code attribute (using short_name)
     */
    public function getDepartmentCodeAttribute()
    {
        return $this->department->short_name ?? 'GEN';
    }
}
