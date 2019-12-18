import React from 'react';
import { bool, node, oneOf, string, number } from 'prop-types';
import getStatsDestination from './getStatsDestination';
import getStatsPageIdentifier from './getStatsPageIdentifier';
import getOriginContext from './getOriginContext';
import isNotUK from './isNotUK';
import getEnv from './getEnv';
import getMetaUrls from './getMetaUrls';
import variantPropType from '../../models/propTypes/variants';
import nodeLogger from '#lib/logger.node';

const logger = nodeLogger(__filename);

export const RequestContext = React.createContext({});

export const RequestContextProvider = ({
  children,
  bbcOrigin,
  bbcCountry,
  id,
  isAmp,
  pageType,
  service,
  statusCode,
  previousPath,
  pathname,
  variant,
}) => {
  const origin = getOriginContext(bbcOrigin);
  const isUK = !isNotUK(bbcCountry);
  const env = getEnv(origin);
  const platform = isAmp ? 'amp' : 'canonical';
  const statsDestination = getStatsDestination({
    isUK,
    env,
    service,
  });
  const statsPageIdentifier = getStatsPageIdentifier({
    pageType,
    service,
    id,
  });

  const value = {
    env,
    id,
    isUK,
    origin,
    pageType,
    platform,
    statsDestination,
    statsPageIdentifier,
    statusCode,
    previousPath,
    variant,
    ...getMetaUrls(origin, pathname),
  };

  // debugging meta data urls - to be removed
  logger.info(`Meata Urls: ${JSON.stringify(getMetaUrls(origin, pathname))}`);

  // debugging origin - to be removed
  logger.info(`Origin: ${origin}`);

  return (
    <RequestContext.Provider value={value}>{children}</RequestContext.Provider>
  );
};

RequestContextProvider.propTypes = {
  bbcOrigin: string,
  bbcCountry: string,
  children: node.isRequired,
  id: string,
  isAmp: bool.isRequired,
  pageType: oneOf([
    'article',
    'frontPage',
    'media',
    'error',
    'MAP',
    'FIX',
    'STY',
    'PGL',
  ]).isRequired,
  service: string.isRequired,
  statusCode: number,
  pathname: string.isRequired,
  previousPath: string,
  variant: variantPropType,
};

RequestContextProvider.defaultProps = {
  bbcOrigin: null,
  bbcCountry: null,
  id: null,
  statusCode: null,
  previousPath: null,
  variant: null,
};
