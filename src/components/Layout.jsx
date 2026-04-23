import Navbar from './Navbar';

export default function Layout({ children, ...props }) {
  return (
    <div className="app">
      <Navbar {...props} />
      {children}
    </div>
  );
}
