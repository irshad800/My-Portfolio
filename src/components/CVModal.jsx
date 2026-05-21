export default function CVModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Download CV</h3>
        <p>Select the language you'd like to download the CV in.</p>
        <div className="modal-buttons">
          <a href="/IRSHAD_CV_EN.pdf" download className="btn btn-primary" style={{ justifyContent: 'center' }}>
            🇬🇧 English
          </a>
          <a href="/IRSHAD_CV_AR.pdf" download className="btn btn-outline" style={{ justifyContent: 'center' }}>
            🇦🇪 Arabic
          </a>
        </div>
      </div>
    </div>
  );
}
