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
  const [cooldown, setCooldown] = useState(0);
  const [localKeyCount, setLocalKeyCount] = useState(0);

  const hasLocalProgress = localKeyCount > 0;

  function refreshLocalKeyCount() {
    setLocalKeyCount(Object.keys(collectLocalStorageSnapshot()).length);
  }

  useEffect(() => {
    refreshLocalKeyCount();

    getCurrentUser()
      .then((user) => {
        setUserEmail(user?.email ?? null);
        setStatus(user ? "已登录，可以同步进度。" : "当前未登录。请先用邮箱登录。");
      })
      .catch(() => {
        setUserEmail(null);
        setStatus("当前未登录。请先用邮箱登录。");
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email ?? null);
      setStatus(session?.user ? "已登录，可以同步进度。" : "当前未登录。请先用邮箱登录。");
      refreshLocalKeyCount();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setCooldown((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleSignIn() {
    if (!email.trim()) {
      setStatus("请先输入邮箱。");
      return;
    }

    if (cooldown > 0) {
      setStatus(`请等待 ${cooldown} 秒后再发送登录链接。`);
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

      if (error) throw error;

      setCooldown(60);
      setStatus("登录链接已发送。请在同一个浏览器里打开邮箱并点击 Sign in。");
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

      if (error) throw error;

      setUserEmail(null);
      setStatus("已退出登录。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "退出登录失败。");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveToCloud() {
    const snapshotCount = Object.keys(collectLocalStorageSnapshot()).length;

    if (snapshotCount === 0) {
      setStatus("当前浏览器没有本地进度。请不要上传空进度，可以先从云端恢复。");
      return;
    }

    const confirmed = window.confirm("确认把当前浏览器的本地进度上传到云端吗？");

    if (!confirmed) return;

    setIsBusy(true);
    setStatus("正在上传本地进度到云端……");

    try {
      const payload = collectLocalProgressPayload();
      const result = await saveCloudProgress(payload);

      if (!result) {
        setStatus("请先登录，再上传进度。");
        return;
      }

      refreshLocalKeyCount();
      setStatus("已上传本地进度到云端。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "上传进度失败。");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLoadFromCloud() {
    const confirmed = window.confirm("确认把云端进度恢复到当前浏览器吗？");

    if (!confirmed) return;

    setIsBusy(true);
    setStatus("正在从云端恢复进度……");

    try {
      const data = await loadCloudProgress();

      if (!data) {
        setStatus("云端还没有进度。请先在有学习记录的浏览器里上传本地进度。");
        return;
      }

      const restoredCount = restoreCloudProgressToLocal(data);

      refreshLocalKeyCount();
      setStatus(`已恢复 ${restoredCount} 个本地进度项。刷新学习页后生效。`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "恢复进度失败。");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="account-page">
      <div className="account-shell">
        <header className="account-topbar">
          <Link href="/" className="account-back-link">
            ← 返回首页
          </Link>

          <span className="account-beta-pill">Cloud Sync Beta</span>
        </header>

        <section className="account-hero-card">
          <div>
            <p className="account-eyebrow">账户与云端同步</p>
            <h1 className="account-title">同步学习进度</h1>
            <p className="account-description">
              登录后，可以把当前浏览器里的学习进度备份到云端。
              换浏览器或换设备后，用同一邮箱登录，再从云端恢复。
            </p>
          </div>

          <div className="account-status-pill">
            <span>{userEmail ? "已登录" : "未登录"}</span>
            <strong>{userEmail ? userEmail : "邮箱登录"}</strong>
          </div>
        </section>

        <div className="account-grid">
          <section className="account-card">
            <div className="account-card-header">
              <div>
                <p className="account-card-kicker">Step 1</p>
                <h2>登录账号</h2>
              </div>
            </div>

            <p className="account-muted">
              请在同一个浏览器里完成登录。比如 Chrome 发送登录链接，就用 Chrome 打开邮箱并点击 Sign in。
            </p>

            {!userEmail ? (
              <div className="account-form">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="输入邮箱"
                  className="account-input"
                />

                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isBusy || cooldown > 0}
                  className="account-primary-button"
                >
                  {cooldown > 0 ? `${cooldown} 秒后重试` : "发送登录链接"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isBusy}
                className="account-secondary-button"
              >
                退出登录
              </button>
            )}
          </section>

          <section className="account-card">
            <div className="account-card-header">
              <div>
                <p className="account-card-kicker">Step 2</p>
                <h2>同步进度</h2>
              </div>

              <div className="account-count-badge">
                <strong>{localKeyCount}</strong>
                <span>本地进度项</span>
              </div>
            </div>

            <p className="account-muted">
              在有学习记录的浏览器里上传。本地进度为 0 时，不要上传空数据，应该先从云端恢复。
            </p>

            <div className="account-sync-actions">
              <button
                type="button"
                onClick={handleSaveToCloud}
                disabled={isBusy || !userEmail || !hasLocalProgress}
                className="account-primary-button"
              >
                上传到云端
              </button>

              <button
                type="button"
                onClick={handleLoadFromCloud}
                disabled={isBusy || !userEmail}
                className="account-secondary-button"
              >
                从云端恢复
              </button>
            </div>
          </section>
        </div>

        <section className="account-message-card">
          <p className="account-message-label">当前状态</p>
          <p>{status}</p>
        </section>

        <section className="account-note-card">
          <div>
            <strong>使用建议</strong>
            <span>旧设备先上传，新设备再恢复。</span>
          </div>

          <div>
            <strong>安全提醒</strong>
            <span>不要把空浏览器的 0 进度上传覆盖云端。</span>
          </div>
        </section>
      </div>
    </main>
  );
}
