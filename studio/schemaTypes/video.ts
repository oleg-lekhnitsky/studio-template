import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'video',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'file',
      type: 'file',
      description: 'Use a compressed MP4 or WebM. Short loops without audio load fastest.',
      options: { accept: 'video/mp4,video/webm' }
    }),
    defineField({
      name: 'url',
      title: 'External video URL',
      type: 'url',
      description: 'Paste a Vimeo page URL, for example https://vimeo.com/1127174952.'
    }),
    defineField({ name: 'poster', type: 'image' }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect ratio',
      type: 'string',
      description: 'Choose the shape of the Vimeo player.',
      options: {
        list: [
          { title: 'Landscape 16:9', value: '16:9' },
          { title: 'Landscape 4:3', value: '4:3' },
          { title: 'Square 1:1', value: '1:1' },
          { title: 'Portrait 4:5', value: '4:5' },
          { title: 'Portrait 9:16', value: '9:16' }
        ],
        layout: 'radio'
      },
      initialValue: '16:9'
    }),
    defineField({ name: 'width', type: 'string', options: { list: ['half', 'full'], layout: 'radio' }, initialValue: 'full' })
  ],
  validation: rule => rule.custom(value => value?.file || value?.url ? true : 'Add a video file or URL')
})
