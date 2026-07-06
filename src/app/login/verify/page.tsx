export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          메일을 확인해주세요
        </h2>
        <p className="text-gray-500 text-sm">
          로그인 링크를 이메일로 발송했습니다.
          <br />
          링크는 15분 후 만료됩니다.
        </p>
      </div>
    </div>
  );
}
