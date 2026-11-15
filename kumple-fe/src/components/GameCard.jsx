import { Link } from "react-router-dom";

const FALLBACK_IMAGE = "https://via.placeholder.com/300x200?text=No+Image";

export default function GameCard({ game }) {
  const imageSrc = game.image || FALLBACK_IMAGE;

  return (
    <article className={`game-card ${game.category.toLowerCase()}`}>
      <figure className="game-image">
        <span
          className={`game-tile tile-${game.maxPlayers}`}
          title={`Maksimal ${game.maxPlayers} pemain`}
          aria-hidden="true"
        />
        <img
          src={imageSrc}
          alt={`Kotak game ${game.name}`}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE;
            event.currentTarget.onerror = null;
          }}
        />
      </figure>
      <h2 className="game-title">
        <Link className="game-link" to={`/games/${game.id}`}>
          {game.name}
        </Link>
      </h2>
      <p className="game-info">
        {game.minPlayers}-{game.maxPlayers} pemain | {game.duration} |{" "}
        <span className="game-tag">{game.category}</span>
      </p>
    </article>
  );
}
