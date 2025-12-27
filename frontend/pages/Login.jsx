import React from "react";

const Login= () => {
  return (
    <>
      <div className="flex m-[20vw] items-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.08)] px-5 py-2">
          <h1 className="text-indigo-500 font-bold text-4xl">Login</h1>
          <div className="text-white/60 mt-5 flex flex-col gap-1 font-semibold">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              placeholder="Enter email address"
              className="w-full rounded-lg border space-y-1 px-2 py-1"
            />

            <label htmlFor="pass" className="mt-2">Password</label>
            <input
              id="pass"
              type="text"
              placeholder="Enter password"
              onChange= {(e)=> set}
              className="w-full rounded-lg border space-y-1 px-2 py-1"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
