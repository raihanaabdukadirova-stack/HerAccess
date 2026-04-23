export default function HomePage({ setPage, user }) {
  return (
    <div className="page">
      <div className="hero">
        <h1>Knowledge is your freedom</h1>

        <button onClick={() => setPage(user ? 'subjects' : 'register')}>Start Learning</button>
      </div>
    </div>
  );
}
