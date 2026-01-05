export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">登入錯誤</h1>
        <p className="mb-4">登入過程中發生錯誤，請重試。</p>
        <a href="/auth/login" className="text-blue-500 hover:underline">
          返回登入
        </a>
      </div>
    </div>
  );
}

