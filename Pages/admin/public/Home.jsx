import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Book trusted local services in a couple of taps.</h1>
          <p className="lede">
            Massage, salon, fitness, and spa appointments — pick a time that works and
            we'll hold your spot. No phone calls, no waiting on hold.
          </p>
          <div className="hero-actions">
            <Link to="/services" className="btn btn-primary">Browse services</Link>
            <Link to="/register" className="btn btn-outline">Create an account</Link>
          </div>
        </div>
        <div className="hero-art">
          <div className="tag">"Booked my haircut in under a minute — and got a reminder the day before."</div>
        </div>
      </section>

      <section className="section-title">
        <div>
          <h2>How it works</h2>
          <p>Three steps, no back-and-forth.</p>
        </div>
      </section>
      <div className="service-grid" style={{ marginBottom: 40 }}>
        <div className="card service-card">
          <span className="cat">Step 1</span>
          <h3>Pick a service</h3>
          <p className="desc">Browse categories from wellness to fitness and see live pricing.</p>
        </div>
        <div className="card service-card">
          <span className="cat">Step 2</span>
          <h3>Choose a time</h3>
          <p className="desc">Select a date and time slot that fits your schedule.</p>
        </div>
        <div className="card service-card">
          <span className="cat">Step 3</span>
          <h3>Show up</h3>
          <p className="desc">Track and manage every booking from your account.</p>
        </div>
      </div>
    </>
  );
}
