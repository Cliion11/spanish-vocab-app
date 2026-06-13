import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell home-shell">
      <nav className="top-nav">
        <Link href="/" className="logo">
          <span className="logo-mark">西</span>
          <span>Spanish Vocab</span>
        </Link>

        <div className="nav-links">
          <Link href="/study" className="nav-link">
            A1 学习
          </Link>
          <Link href="/mistakes" className="nav-link">
            错题本
          </Link>
          <Link href="/settings" className="nav-link">
    设置
  </Link>
        </div>
      </nav>

      <section className="home-center">
        <div className="glass-card home-card">
          <p className="eyebrow">Monet Glass Learning</p>

          <h1 className="home-title">
            用更轻的方式，
            <br />
            记住西语单词。
          </h1>

          <p className="home-subtitle">
            每天几分钟，用单词卡片、错题本和轻量复习，
            慢慢建立你的西语词汇量。
          </p>

          <div className="home-actions">
            <Link href="/study" className="primary-button">
              开始今日学习
            </Link>

            <Link href="/mistakes" className="glass-button">
              查看错题本
            </Link>
          </div>

          <div className="home-mini-grid">
            <div className="home-mini-item">
              <strong>A1</strong>
              <span>当前等级</span>
            </div>

            <div className="home-mini-item">
              <strong>20</strong>
              <span>今日目标</span>
            </div>

            <div className="home-mini-item">
              <strong>5 min</strong>
              <span>轻量复习</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}