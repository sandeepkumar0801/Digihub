import PropTypes from 'prop-types';
import React from 'react';
import './ResetPasswordForm.css';
import { NavBar } from '../../components/Navbar/Navbar';

function Success() {
  return (
    <div className="flex justify-center items-center">
      <div className="reset-password-form flex justify-center items-center">
        <div className="reset-password-form-inner">
          <p className="text-center text-success">
            We have sent you an email with a link to reset your password. Please check your inbox.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResetForm({ action, onSuccess }) {
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Your form submission logic here
  };

  return (
    <>
      <NavBar />
      <div className="reset-password-container">
        <div className="flex justify-center items-center">
          <div className="reset-password-form flex justify-center items-center">
            <div className="reset-password-form-inner">
              <h3 className="text-center">Enter your email address</h3>
              {error && <div className="text-critical mb-1">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-field-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="form-submit-button flex border-t border-divider mt-1 pt-1">
                  <button type="submit">RESET PASSWORD</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

ResetForm.propTypes = {
  action: PropTypes.string.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export const ResetPasswordForm = ({ action }) => {
  const [success, setSuccess] = React.useState(null);

  return success ? (
    <Success />
  ) : (
    <ResetForm
      action={action}
      onSuccess={() => {
        setSuccess(true);
      }}
    />
  );
}

ResetPasswordForm.propTypes = {
  action: PropTypes.string.isRequired
};

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

export const query = `
  query Query {
    action: url(routeId: "resetPassword")
  }
`;
