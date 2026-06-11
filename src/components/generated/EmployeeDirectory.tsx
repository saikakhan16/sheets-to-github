import { useState, useMemo } from 'react';

interface Employee {
  Name: string;
  Role: string;
  Deparment: string;
  Email: string;
}

const employees: Employee[] = [
  {
    "Name": "saika",
    "Role": "developer",
    "Deparment": "engineer",
    "Email": "saikakhancse@gmail.com"
  },
  {
    "Name": "qasir",
    "Role": "designer",
    "Deparment": "design",
    "Email": "qasirkhan9852@gmail.com"
  }
];

export const EmployeeDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee =>
      employee.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.Role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.Deparment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.Email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      engineer: 'bg-blue-100 text-blue-800 border-blue-200',
      design: 'bg-purple-100 text-purple-800 border-purple-200',
      marketing: 'bg-green-100 text-green-800 border-green-200',
      sales: 'bg-orange-100 text-orange-800 border-orange-200',
      hr: 'bg-pink-100 text-pink-800 border-pink-200',
    };
    return colors[department.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-pink-500',
      'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Directory</h1>
          <p className="text-gray-600 mb-6">Find and connect with your teammates</p>
          
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 group"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-14 h-14 rounded-full ${getAvatarColor(employee.Name)} flex items-center justify-center text-white font-semibold text-lg shadow-sm`}>
                  {getInitials(employee.Name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize group-hover:text-blue-600 transition-colors duration-200">
                    {employee.Name}
                  </h3>
                  <p className="text-gray-600 capitalize font-medium">
                    {employee.Role}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a
                    href={`mailto:${employee.Email}`}
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 truncate"
                  >
                    {employee.Email}
                  </a>
                </div>

                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getDepartmentColor(employee.Deparment)}`}>
                    {employee.Deparment}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm group-hover:bg-blue-50 group-hover:text-blue-700">
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDirectory;