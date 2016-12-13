import Handlebars from 'handlebars';
import fsp from 'fs-promise';
import path from 'path';
import slug from 'slug';

import logger from './logger';

const writePosts = (posts, OPTIONS) => {
  const templatePath = path.resolve(__dirname, '../templates/post.hbs');
  const postsOutputDir = `${OPTIONS.outputDir}/posts`;
  return fsp.mkdirs(postsOutputDir)
    .then(createdDirectory => {
      if (createdDirectory) {
        logger.info('Created directory %s', createdDirectory);
      }
    })
    .then(() => fsp.readFile(templatePath, 'utf8'))
    .then(templateString => {
      const template = Handlebars.compile(templateString);
      return posts.map(post => writeOutPostFile(template, post, postsOutputDir));
    })
    .catch(error => logger.error(error))
};

const writeOutPostFile = (template, postData, postsOutputDir) => {
  const postSlug = slug(postData.fields.title, { lower: true });
  const filename = `${postsOutputDir}/${postSlug}.md`;
  const compiledTemplate = template({
    title: postData.fields.title,
    author: postData.fields.author[0].fields,
    body: postData.fields.body,
  });
  return fsp.writeFile(filename, compiledTemplate)
    .then(() => logger.info('Written %s', filename))
    .catch(error => logger.error('Error writing %s, %s', filename, error));
};

export default writePosts;
