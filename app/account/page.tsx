"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getCurrentUser,
  loadCloudProgress,
  saveCloudProgress,
} from "@/lib/cloudProgress";
import {
  collectLocalProgressPayload,
  collectLocalStorageSnapshot,
  restoreCloudProgressToLocal,
} from "@/lib/localProgress";

export default function AccountPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [status, setStatus] = useState("正在检查登录状态……");
  const [isBusy, setIsBusy] = useState(false);
  const [localKeyCount, setLocalKeyCount] = useState(0);

  useEffect(() => {
    setLocalKeyCount(Object.keys(collectLocalStorageSnapshot()).length);

    getCurrentUser()
      .then((user) => {
        setUserEmail(user?.email ?? null);
        setStatus(user ? "已登录，可以同步进度。" : "未登录。请输入邮箱获取登录链接。");
      })
      .catch((error) => {
        setStatus(`检查登录状态失败：${error.message}`);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      setStatus(session?.user ? "已登录，可以同步进度。" : "未登录。请输入邮箱获取登录链接。");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSignIn() {
    if (!email.trim()) {
      setStatus("请先输入邮箱。");
      return;
    }

    setIsBusy(true);
    setStatus("正在发送登录链接……");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });

      if (error) {
        throw error;
      }

      setStatus("登录链接已发送。请打开邮箱，点击 Supabase 发来的登录链接。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "发送登录链接失败。");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSignOut() {
    setIsBusy(true);
    setStatus("正在退出登录……");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUserEmail(null);
      setStatus("已退出登录。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "退出登录失败。");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveToCloud() {
    setIsBusy(true);
    setStatus("正在上传本地进度到云端……");

    try {
      const payload = collectLocalProgressPayload();
      const result = await saveCloudProgress(payload);

      if (!result) {
        setStatus("请先登录，再上传进度。");
        return;
      }

      setLocalKeyCount(Object.keys(collectLocalStorageSnapshot()).length);
      setStatus("已上传本地进度到云端。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "上传进度失败。");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLoadFromCloud() {
    setIsBusy(true);
    setStatus("正在从云端恢复进度……");

    try {
      const data = await loadCloudProgress();

      if (!data) {
        setStatus("云端还没有进度。建议先点击“上传本地进度到云端”。");
        return;
      }

      const restoredCount = restoreCloudProgressToLocal(data);
      setLocalKeyCount(Object.keys(collectLocalStorageSnapshot()).length);

      setStatus(`已从云端恢复 ${restoredCount} 个本地进度项。刷新学习页后生效。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "恢复进度失败。");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← 返回首页
      </Link>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500">账户与云端同步</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">同步学习进度</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          当前版本先保留浏览器本地进度，同时提供云端备份。首次登录后，建议先上传本地进度，避免空云端数据覆盖已有学习记录。
        </p>
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">登录状态</h2>

        <p className="mt-3 text-sm text-slate-600">
          {userEmail ? `当前账号：${userEmail}` : "当前未登录"}
        </p>

        {!userEmail ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="输入邮箱"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isBusy}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              发送登录链接
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isBusy}
            className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-50"
          >
            退出登录
          </button>
        )}
      </section>

      <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">进度同步</h2>

        <p className="mt-3 text-sm text-slate-600">
          当前浏览器检测到 {localKeyCount} 个本地进度项。
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSaveToCloud}
            disabled={isBusy || !userEmail}
            className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            上传本地进度到云端
          </button>

          <button
            type="button"
            onClick={handleLoadFromCloud}
            disabled={isBusy || !userEmail}
            className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            从云端恢复到本地
          </button>
        </div>

        <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {status}
        </p>
      </section>
    </main>
  );
}
