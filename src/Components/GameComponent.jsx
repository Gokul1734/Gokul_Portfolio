const GameComponent = ({ title, url }) => {
  return (
    <div className="gametab">
      <iframe
        title={title}
        src={url}
        allow="fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
};

export default GameComponent;
