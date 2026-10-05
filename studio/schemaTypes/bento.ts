import { defineField, defineType } from 'sanity'

const tileCounts: Record<string, number> = {
  halves: 2,
  'stack-left': 3,
  'stack-right': 3,
  quarters: 4,
  thirds: 3,
  'large-left-split-right': 4,
  'large-left': 5,
  'large-right': 5
}

export default defineType({
  name: 'bento',
  title: 'Bento',
  type: 'object',
  fields: [
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'stack-left',
      options: {
        list: [
          { title: 'Two equal tiles', value: 'halves' },
          { title: 'Two stacked left, tall right', value: 'stack-left' },
          { title: 'Tall left, two stacked right', value: 'stack-right' },
          { title: 'Four equal tiles', value: 'quarters' },
          { title: 'Three equal columns', value: 'thirds' },
          { title: 'Tall left, two small above wide right', value: 'large-left-split-right' },
          { title: 'Large left, four small right', value: 'large-left' },
          { title: 'Four small left, large right', value: 'large-right' }
        ]
      },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Group shape',
      type: 'string',
      initialValue: '16:9',
      options: { list: ['16:9', '4:3', '1:1', '4:5'] },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'tiles',
      title: 'Tiles',
      description: 'Tiles fill each column from top to bottom, then move right. For tall left with two small above wide right: 1 is left, 2 and 3 are top right, 4 is bottom right. Tile width follows the layout. Media is cropped to fill each tile.',
      type: 'array',
      of: [{ type: 'galleryImage' }, { type: 'video' }],
      validation: rule => rule.required().custom((value, context) => {
        const layout = (context.parent as { layout?: string } | undefined)?.layout
        const count = layout ? tileCounts[layout] : undefined
        return !count || value?.length === count ? true : `Add exactly ${count} tiles for this layout.`
      })
    })
  ],
  preview: {
    select: { layout: 'layout', media: 'tiles.0.image' },
    prepare: ({ layout, media }) => ({ title: 'Bento', subtitle: layout, media })
  }
})
