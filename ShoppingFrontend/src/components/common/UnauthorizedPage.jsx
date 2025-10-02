const UnauthorizedPage = () => {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="text-gray-600">You do not have permission to view this page.</p>
        <a href="/" className="mt-4 text-blue-600 hover:underline">Go back to home</a>
      </div>
    );
  };
  
  export default UnauthorizedPage;