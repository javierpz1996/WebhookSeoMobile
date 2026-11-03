import { Image } from 'expo-image';
import { Fragment, isValidElement, type ReactNode } from 'react';
import { View, type ImageStyle, type ViewStyle } from 'react-native';
import { Renderer } from 'react-native-marked';

import type { ThemeTokens } from '@/ui/theme/tokens';

function keySiblingNodes(renderer: Renderer, children: ReactNode[]): ReactNode[] {
  return children.map((child, index) => {
    if (isValidElement(child) && child.key !== null && child.key !== '') {
      return child;
    }
    return (
      <Fragment key={`${renderer.getKey()}-${String(index)}`}>{child}</Fragment>
    );
  });
}

class ArticleMarkdownRenderer extends Renderer {
  constructor(private readonly theme: ThemeTokens) {
    super();
  }

  paragraph(children: ReactNode[], styles?: ViewStyle): ReactNode {
    return super.paragraph(keySiblingNodes(this, children), {
      ...styles,
      width: '100%',
      alignSelf: 'stretch',
    });
  }

  blockquote(children: ReactNode[], styles?: ViewStyle): ReactNode {
    return super.blockquote(keySiblingNodes(this, children), {
      ...styles,
      width: '100%',
      alignSelf: 'stretch',
    });
  }

  listItem(children: ReactNode[], styles?: ViewStyle): ReactNode {
    return super.listItem(keySiblingNodes(this, children), styles);
  }

  image(uri: string, alt?: string, styles?: ImageStyle): ReactNode {
    const imageBlockStyle: ImageStyle = {
      width: '100%',
      height: this.theme.articleMedia.inlineHeight,
      borderRadius: this.theme.radius.image,
      backgroundColor: this.theme.colors.neutral.controlGray,
    };

    return (
      <View
        key={this.getKey()}
        style={{
          width: '100%',
          alignSelf: 'stretch',
          marginVertical: this.theme.spacing.sm,
        }}
      >
        <Image
          accessibilityLabel={alt ?? 'Imagen del artículo'}
          source={{ uri }}
          contentFit="cover"
          cachePolicy="memory-disk"
          style={[imageBlockStyle, styles]}
        />
      </View>
    );
  }
}

export function createArticleMarkdownRenderer(theme: ThemeTokens): Renderer {
  return new ArticleMarkdownRenderer(theme);
}
