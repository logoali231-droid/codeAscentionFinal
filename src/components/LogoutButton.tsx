"use client";

export default function LogoutButton() {
  function logout() {
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <button onClick={logout} className="text-red-500">
      Logout
    </button>
  );
}