import Header from "./components/Header";

function App() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <Header />
      <main className="p-8">
        <h2 className="text-xl">
          Welcome to the OTC Platform. Connect your wallet to get started.
        </h2>
        {/* We will add the offer creation form here in the next step */}
      </main>
    </div>
  );
}

export default App;