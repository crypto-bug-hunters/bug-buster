import { Link } from 'gatsby';
import * as React from 'react';
import { Helmet } from 'react-helmet';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>
          404 Page Not Found - Cartesi - Application-specific rollups with a
          Linux runtime.
        </title>
        <meta
          name='description'
          content='Scaling Computation. Transcending EVM Limitations.'
        />
      </Helmet>
      <div className='grid h-screen place-content-center bg-gray-900 text-yellow-50'>
        <div>
          <div className='prose prose-2xl prose-invert prose-h1:mb-0 prose-p:mt-0'>
            <h1>404</h1>
            <p>Page Not found</p>
          </div>
          <p className='mt-20'>
            <Link to='/' className='btn-outline-inverted'>
              <span>Go home now</span>
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
