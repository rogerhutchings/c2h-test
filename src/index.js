import contentful from 'contentful';
import util from 'util';
import Handlebars from 'handlebars';
import fsp from 'fs-promise';
import path from 'path';
import slug from 'slug';

let OPTIONS;
let CLIENT;

const writePosts = (posts) => {
  const templatePath = path.resolve(__dirname, '../templates/post.hbs');
  const postsOutputDir = `${OPTIONS.outputDir}/posts`;
  return fsp.mkdirs(postsOutputDir)
    .then(() => fsp.readFile(templatePath, 'utf8'))
    .then(templateString => {
      const template = Handlebars.compile(templateString);
      return posts.map(post => writeOutPostFile(template, post, postsOutputDir));
    })
    .catch(error => console.log(error))
};

const writeOutPostFile = (template, postData, postsOutputDir) => {
  const postSlug = slug(postData.fields.title, { lower: true });
  const compiledTemplate = template({
    title: postData.fields.title,
    author: postData.fields.author[0].fields,
    body: postData.fields.body,
  });
  return fsp.writeFile(`${postsOutputDir}/${postSlug}.md`, compiledTemplate);
};

const main = (options) => {
  OPTIONS = options;
  CLIENT = contentful.createClient({
    space: OPTIONS.space,
    accessToken: OPTIONS.accessToken,
  });

  return CLIENT.getContentTypes()
    .then(contentTypes => {
      const postId = contentTypes.items.find(type => type.name === 'Post').sys.id;
      return CLIENT.getEntries({ 
        content_type: postId, 
        include: 1 
      });
    })
    .then(results => writePosts(results.items));
}

export default main;
