import React, { useContext } from 'react';
import path from 'ramda/src/path';
import styled from '@emotion/styled';
import Lazyload from 'react-lazyload';
import {
  AmpSocialEmbed,
  CanonicalSocialEmbed,
} from '@bbc/psammead-social-embed';
import { GEL_SPACING_TRPL } from '@bbc/gel-foundations/spacings';
import { RequestContext } from '#contexts/RequestContext';
import { ServiceContext } from '#contexts/ServiceContext';
import nodeLogger from '#lib/logger.node';
import { SOCIAL_EMBED_RENDERED } from '#lib/logger.const';
import { GridItemMedium } from '#app/components/Grid';
import useToggle from '#hooks/useToggle';
import socialEmbedBlockPropTypes from '#models/propTypes/socialEmbed';
import createTranslations from './translations';
import EnrichTweet from './enrichTweet';

const logger = nodeLogger(__filename);

/**
 * MAX_WIDTH ensures all provider embeds take up the same width.
 * NB Tweets max-out at 500px, which is represented as 31.25rem.
 */
const MAX_WIDTH = '31.25rem';

const LAZYLOAD_OFFSET = 250; // amount of pixels below the viewport to begin loading the image

const Wrapper = styled.div`
  margin-right: auto;
  margin-left: auto;
  margin-bottom: ${GEL_SPACING_TRPL};
  max-width: ${MAX_WIDTH};
`;

const SocialEmbedContainer = ({ blocks }) => {
  const { isAmp } = useContext(RequestContext);
  const { service, translations } = useContext(ServiceContext);
  const { enabled } = useToggle('socialEmbed');

  if (!blocks || !enabled) return null;

  const { type: provider, indexOfType, model } = blocks[0];
  const index = indexOfType + 1;

  const id = path(['id'], model);
  const href = path(['href'], model);
  if (!href) return null;

  const oEmbed = path(['embed', 'oembed'], model);

  const {
    fallback: fallbackTranslations,
    skipLink: skipLinkTranslations,
    caption: captionTranslations,
  } = createTranslations({ translations, index });

  const fallback = {
    ...fallbackTranslations,
    linkHref: href,
  };

  const skipLink = {
    ...skipLinkTranslations,
    endTextId: `skip-%provider%-content-${index}`,
  };

  const caption = provider === 'youtube' ? captionTranslations : null;

  logger.info(SOCIAL_EMBED_RENDERED, {
    provider,
    href,
  });

  const socialEmbed = (
    <CanonicalSocialEmbed
      provider={provider}
      service={service}
      oEmbed={oEmbed}
      fallback={fallback}
      skipLink={skipLink}
      caption={caption}
    />
  );

  const enrichedSocialEmbed =
    provider === 'twitter' ? (
      <EnrichTweet>{socialEmbed}</EnrichTweet>
    ) : (
      socialEmbed
    );

  return (
    <GridItemMedium>
      <Wrapper provider={provider} data-e2e={`${provider}-embed-${href}`}>
        {isAmp ? (
          <AmpSocialEmbed
            provider={provider}
            service={service}
            id={id}
            fallback={fallback}
            skipLink={skipLink}
            caption={caption}
          />
        ) : (
          <Lazyload offset={LAZYLOAD_OFFSET} once>
            {enrichedSocialEmbed}
          </Lazyload>
        )}
      </Wrapper>
    </GridItemMedium>
  );
};

SocialEmbedContainer.propTypes = socialEmbedBlockPropTypes;

export default SocialEmbedContainer;
