import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WatchDetail = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home for now - this would be the movie detail page
    navigate('/');
  }, [navigate]);

  return null;
};

export default WatchDetail;
