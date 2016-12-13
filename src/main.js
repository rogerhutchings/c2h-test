import contentful from 'contentful';

import writePosts from './posts';
import logger from './logger';

const main = (options) => {
  const OPTIONS = options;
  const CLIENT = contentful.createClient({
    space: OPTIONS.space,
    accessToken: OPTIONS.accessToken,
  });

  logger.info('Fetching content types for Contentful space %s', OPTIONS.space);
  return CLIENT.getContentTypes()
    .then(contentTypes => {
      logger.info('Found %s content types', contentTypes.items.length);
      const postId = contentTypes.items.find(type => type.name === 'Post').sys.id;
      return CLIENT.getEntries({ 
        content_type: postId, 
        include: 1,
      });
    })
    .then(results => writePosts(results.items, OPTIONS));
}

export default main;
