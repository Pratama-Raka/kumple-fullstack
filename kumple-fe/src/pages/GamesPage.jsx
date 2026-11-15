import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import GameCard from "../components/GameCard";

export default function GamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState("");

  const observer = useRef();

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const fetchGames = async (currentPage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "https://meepleit.p.rapidapi.com/boardgames",
        {
          params: { page: currentPage, limit: 12 },
          headers: {
            "x-rapidapi-key":
              "eb3948cd7cmshd215d7fd5fc8f78p110f50jsnebb3f6ecb970",
            "x-rapidapi-host": "meepleit.p.rapidapi.com",
          },
        },
      );

      const rawData = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      const formattedGames = rawData.map((game) => ({
        id: game.id ? game.id.toString() : Math.random().toString(),
        name: game.name || "Judul Tidak Diketahui",
        category: game.categories?.[0] || "Strategy",
        minPlayers: game.minPlayers || 2,
        maxPlayers: game.maxPlayers || 4,
        duration: `${game.minPlayTime || 30}-${game.maxPlayTime || 60} Menit`,
        image:
          game.thumbnail ||
          game.image ||
          "https://via.placeholder.com/300x200?text=No+Image",
      }));

      setGames((prev) => {
        const newGames = formattedGames.filter(
          (newGame) => !prev.some((prevGame) => prevGame.id === newGame.id),
        );
        return [...prev, ...newGames];
      });

      if (rawData.length === 0 || currentPage >= 5) {
        setHasMore(false);
      }
    } catch (err) {
      setError(
        "Gagal menjalin komunikasi dengan peladen MeepleIT di RapidAPI.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(page);
  }, [page]);

  const filteredGames = games.filter((game) => {
    const nameMatches = game.name.toLowerCase().includes(search.toLowerCase());
    const playersMatch =
      !players ||
      (players === "2"
        ? game.minPlayers <= 2 && game.maxPlayers >= 2
        : players === "3-4"
          ? game.minPlayers <= 4 && game.maxPlayers >= 3
          : game.maxPlayers >= 5);
    return nameMatches && playersMatch;
  });

  return (
    <main>
      <h1 className="page-title">Katalog Game</h1>

      {error && page === 1 ? (
        <div className="empty-state" style={{ marginTop: "40px" }}>
          <p
            style={{
              marginBottom: "16px",
              color: "var(--red)",
              fontSize: "20px",
            }}
          >
            {error}
          </p>
          <button className="btn btn-yellow" onClick={() => fetchGames(1)}>
            Coba Lagi Sekarang
          </button>
        </div>
      ) : (
        <form
          className="filter-form flex flex-wrap items-end justify-center gap-4 px-0 py-0 max-[1000px]:justify-start max-[760px]:items-stretch max-[760px]:gap-3"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="field field-search">
            <label className="field-label" htmlFor="game-search">
              Cari game
            </label>
            <input
              className="input"
              id="game-search"
              type="search"
              placeholder="Nama game..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="game-players">
              Jumlah pemain
            </label>
            <select
              className="input"
              id="game-players"
              value={players}
              onChange={(event) => setPlayers(event.target.value)}
            >
              <option value="">Semua</option>
              <option value="2">2 pemain</option>
              <option value="3-4">3-4 pemain</option>
              <option value="5+">5+ pemain</option>
            </select>
          </div>
          <output className="filter-count" aria-live="polite">
            {`${filteredGames.length} game dimuat`}
          </output>
        </form>
      )}

      {(!error || page > 1) && (
        <section className="game-list grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredGames.length > 0
            ? filteredGames.map((game, index) => {
                if (filteredGames.length === index + 1) {
                  return (
                    <div ref={lastElementRef} key={game.id}>
                      <GameCard game={game} />
                    </div>
                  );
                } else {
                  return <GameCard key={game.id} game={game} />;
                }
              })
            : !loading && (
                <p className="empty-state">
                  Game tidak ditemukan. Coba ubah kata kunci atau filter.
                </p>
              )}
        </section>
      )}

      {loading && (
        <p
          className="empty-state"
          style={{ marginTop: "20px", marginBottom: "40px" }}
        >
          Mensinkronisasikan data...
        </p>
      )}
    </main>
  );
}
