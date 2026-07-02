export default function CVModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Download CV</h3>
        <p>Select your preferred language.</p>
        <div className="modal-buttons">
          <a href={`${import.meta.env.BASE_URL}cv/IRSHAD-SOFTWARE_ENGINEER-CV.ae.pdf`} download className="btn btn-primary" style={{ justifyContent: 'center' }}>
            English CV
          </a>
          <a href={`${import.meta.env.BASE_URL}cv/IRSHAD_CV_Arabic.ae.pdf`} download className="btn btn-outline" style={{ justifyContent: 'center' }}>
            Arabic CV
          </a>
        </div>
      </div>
    </div>
  );
}
