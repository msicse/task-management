import { Head } from '@inertiajs/react';
import { useState } from 'react';
import MultipleSearchableSelect from '@/Components/MultipleSearchableSelect';

export default function UITest() {
  // Sample data for testing
  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'mx', label: 'Mexico' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'it', label: 'Italy' },
    { value: 'es', label: 'Spain' },
    { value: 'jp', label: 'Japan' },
    { value: 'kr', label: 'South Korea' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'au', label: 'Australia' },
    { value: 'br', label: 'Brazil' },
    { value: 'ar', label: 'Argentina' },
  ];

  const skills = [
    { value: 'js', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'angular', label: 'Angular' },
    { value: 'php', label: 'PHP' },
    { value: 'laravel', label: 'Laravel' },
    { value: 'python', label: 'Python' },
    { value: 'django', label: 'Django' },
    { value: 'node', label: 'Node.js' },
    { value: 'express', label: 'Express.js' },
  ];

  const colors = [
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
  ];

  // State for different test scenarios
  const [multiSelectValue, setMultiSelectValue] = useState(['us', 'ca']);
  const [singleSelectValue, setSingleSelectValue] = useState('react');
  const [searchableValue, setSearchableValue] = useState(['js', 'react', 'php']);
  const [nonSearchableValue, setNonSearchableValue] = useState(['red', 'blue']);
  const [limitedValue, setLimitedValue] = useState(['python']);
  const [disabledValue, setDisabledValue] = useState(['vue', 'angular']);

  const [showCode, setShowCode] = useState({});

  const toggleCode = (section) => {
    setShowCode(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const CodeBlock = ({ code, isVisible }) => {
    if (!isVisible) return null;

    return (
      <div className="mt-4 bg-gray-900 rounded-lg p-4 text-sm overflow-x-auto">
        <pre className="text-green-400">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  return (
    <>
      <Head title="UI Test - Multiple Searchable Select" />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              UI Test - Multiple Searchable Select
            </h1>
            <p className="text-lg text-gray-600">
              Test different configurations of the MultipleSearchableSelect component
            </p>
          </div>

          <div className="space-y-12">

            {/* Test 1: Multi-Select with Search */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Multi-Select with Search (Default)
                </h2>
                <button
                  onClick={() => toggleCode('multiSelect')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showCode.multiSelect ? 'Hide Code' : 'Show Code'}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Countries (Multi-select with search enabled)
                </label>
                <MultipleSearchableSelect
                  options={countries}
                  value={multiSelectValue}
                  onChange={setMultiSelectValue}
                  placeholder="Select countries..."
                  searchPlaceholder="Search countries..."
                  className="max-w-md"
                  searchable={true}
                  multiSelect={true}
                />
              </div>

              <div className="text-sm text-gray-600">
                Selected: {JSON.stringify(multiSelectValue)}
              </div>

              <CodeBlock
                isVisible={showCode.multiSelect}
                code={`<MultipleSearchableSelect
  options={countries}
  value={multiSelectValue}
  onChange={setMultiSelectValue}
  placeholder="Select countries..."
  searchPlaceholder="Search countries..."
  searchable={true}
  multiSelect={true}
/>`}
              />
            </div>

            {/* Test 2: Single Select */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Single Select with Search
                </h2>
                <button
                  onClick={() => toggleCode('singleSelect')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showCode.singleSelect ? 'Hide Code' : 'Show Code'}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Technology (Single select)
                </label>
                <MultipleSearchableSelect
                  options={skills}
                  value={singleSelectValue}
                  onChange={setSingleSelectValue}
                  placeholder="Choose one technology..."
                  searchPlaceholder="Search technologies..."
                  className="max-w-md"
                  searchable={true}
                  multiSelect={false}
                  closeOnSelect={true}
                />
              </div>

              <div className="text-sm text-gray-600">
                Selected: {JSON.stringify(singleSelectValue)}
              </div>

              <CodeBlock
                isVisible={showCode.singleSelect}
                code={`<MultipleSearchableSelect
  options={skills}
  value={singleSelectValue}
  onChange={setSingleSelectValue}
  placeholder="Choose one technology..."
  multiSelect={false}
  searchable={true}
  closeOnSelect={true}
/>`}
              />
            </div>

            {/* Test 3: Multi-Select with Search */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Multi-Select with Search
                </h2>
                <button
                  onClick={() => toggleCode('searchableMulti')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showCode.searchableMulti ? 'Hide Code' : 'Show Code'}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Skills (Searchable multi-select)
                </label>
                <MultipleSearchableSelect
                  options={skills}
                  value={searchableValue}
                  onChange={setSearchableValue}
                  placeholder="Select your skills..."
                  searchPlaceholder="Search skills..."
                  className="max-w-md"
                  searchable={true}
                  multiSelect={true}
                  showSelectedCount={true}
                />
              </div>

              <div className="text-sm text-gray-600">
                Selected: {JSON.stringify(searchableValue)}
              </div>

              <CodeBlock
                isVisible={showCode.searchableMulti}
                code={`<MultipleSearchableSelect
  options={skills}
  value={searchableValue}
  onChange={setSearchableValue}
  placeholder="Select your skills..."
  searchable={true}
  multiSelect={true}
  showSelectedCount={true}
/>`}
              />
            </div>

            {/* Test 4: Multi-Select without Search */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Multi-Select without Search
                </h2>
                <button
                  onClick={() => toggleCode('nonSearchable')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showCode.nonSearchable ? 'Hide Code' : 'Show Code'}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Colors (No search)
                </label>
                <MultipleSearchableSelect
                  options={colors}
                  value={nonSearchableValue}
                  onChange={setNonSearchableValue}
                  placeholder="Select colors..."
                  className="max-w-md"
                  searchable={false}
                  multiSelect={true}
                />
              </div>

              <div className="text-sm text-gray-600">
                Selected: {JSON.stringify(nonSearchableValue)}
              </div>

              <CodeBlock
                isVisible={showCode.nonSearchable}
                code={`<MultipleSearchableSelect
  options={colors}
  value={nonSearchableValue}
  onChange={setNonSearchableValue}
  placeholder="Select colors..."
  searchable={false}
  multiSelect={true}
/>`}
              />
            </div>

            {/* Test 5: Limited Selection */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Limited Selection (Max 3 items)
                </h2>
                <button
                  onClick={() => toggleCode('limited')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showCode.limited ? 'Hide Code' : 'Show Code'}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Top 3 Skills
                </label>
                <MultipleSearchableSelect
                  options={skills}
                  value={limitedValue}
                  onChange={setLimitedValue}
                  placeholder="Select up to 3 skills..."
                  searchPlaceholder="Search skills..."
                  className="max-w-md"
                  searchable={true}
                  multiSelect={true}
                  maxItems={3}
                />
              </div>

              <div className="text-sm text-gray-600">
                Selected: {JSON.stringify(limitedValue)} ({limitedValue.length}/3)
              </div>

              <CodeBlock
                isVisible={showCode.limited}
                code={`<MultipleSearchableSelect
  options={skills}
  value={limitedValue}
  onChange={setLimitedValue}
  placeholder="Select up to 3 skills..."
  searchable={true}
  multiSelect={true}
  maxItems={3}
/>`}
              />
            </div>

            {/* Test 6: Disabled State */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Disabled State
                </h2>
                <button
                  onClick={() => toggleCode('disabled')}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {showCode.disabled ? 'Hide Code' : 'Show Code'}
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disabled Select (Read-only)
                </label>
                <MultipleSearchableSelect
                  options={skills}
                  value={disabledValue}
                  onChange={setDisabledValue}
                  placeholder="This is disabled..."
                  className="max-w-md"
                  disabled={true}
                  multiSelect={true}
                />
              </div>

              <div className="text-sm text-gray-600">
                Selected: {JSON.stringify(disabledValue)}
              </div>

              <CodeBlock
                isVisible={showCode.disabled}
                code={`<MultipleSearchableSelect
  options={skills}
  value={disabledValue}
  onChange={setDisabledValue}
  placeholder="This is disabled..."
  disabled={true}
  multiSelect={true}
/>`}
              />
            </div>

            {/* Component Props Documentation */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Component Props
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prop
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Default
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    <tr>
                      <td className="px-6 py-4 font-mono text-blue-600">options</td>
                      <td className="px-6 py-4">Array</td>
                      <td className="px-6 py-4">[]</td>
                      <td className="px-6 py-4">Array of {`{value, label}`} objects</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-mono text-blue-600">value</td>
                      <td className="px-6 py-4">Array|String</td>
                      <td className="px-6 py-4">[]</td>
                      <td className="px-6 py-4">Selected value(s)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono text-blue-600">onChange</td>
                      <td className="px-6 py-4">Function</td>
                      <td className="px-6 py-4">-</td>
                      <td className="px-6 py-4">Callback when selection changes</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-mono text-blue-600">searchable</td>
                      <td className="px-6 py-4">Boolean</td>
                      <td className="px-6 py-4">true</td>
                      <td className="px-6 py-4">Enable/disable search functionality</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono text-blue-600">multiSelect</td>
                      <td className="px-6 py-4">Boolean</td>
                      <td className="px-6 py-4">true</td>
                      <td className="px-6 py-4">Enable multiple selection</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-mono text-blue-600">maxItems</td>
                      <td className="px-6 py-4">Number</td>
                      <td className="px-6 py-4">null</td>
                      <td className="px-6 py-4">Maximum number of selections</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono text-blue-600">disabled</td>
                      <td className="px-6 py-4">Boolean</td>
                      <td className="px-6 py-4">false</td>
                      <td className="px-6 py-4">Disable the component</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-mono text-blue-600">closeOnSelect</td>
                      <td className="px-6 py-4">Boolean</td>
                      <td className="px-6 py-4">false</td>
                      <td className="px-6 py-4">Close dropdown after selection</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-mono text-blue-600">allowClear</td>
                      <td className="px-6 py-4">Boolean</td>
                      <td className="px-6 py-4">true</td>
                      <td className="px-6 py-4">Show clear/remove buttons</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-mono text-blue-600">showSelectedCount</td>
                      <td className="px-6 py-4">Boolean</td>
                      <td className="px-6 py-4">true</td>
                      <td className="px-6 py-4">Show count when many items selected</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500">
            <p>This is a public route for UI testing - no authentication required</p>
          </div>
        </div>
      </div>
    </>
  );
}
