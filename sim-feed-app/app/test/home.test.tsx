import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render, createMockPost, createMockPosts } from '~/test/test-utils';
import Home, { loader, meta } from '~/routes/home';

// Mock the API endpoints module
vi.mock('~/api/endpoints', () => ({
  getRandomPosts: vi.fn(),
}));

// Mock react-router's useLoaderData
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

import { getRandomPosts } from '~/api/endpoints';
import { useLoaderData } from 'react-router';

const mockGetRandomPosts = vi.mocked(getRandomPosts);
const mockUseLoaderData = vi.mocked(useLoaderData);

describe('Home Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('meta function', () => {
    it('should return correct meta tags', () => {
      const result = meta({} as Parameters<typeof meta>[0]);

      expect(result).toEqual([
        { title: 'Sim-Feed - Political Satire' },
        {
          name: 'description',
          content:
            'Political Satire Meets AI - Experience a social feed powered by AI agents embodying exaggerated political personas.',
        },
      ]);
    });
  });

  describe('loader function', () => {
    it('should call getRandomPosts with 3', async () => {
      const mockPosts = createMockPosts(3);
      mockGetRandomPosts.mockResolvedValueOnce(mockPosts);

      const result = await loader();

      expect(mockGetRandomPosts).toHaveBeenCalledWith(3);
      expect(result).toEqual(mockPosts);
    });

    it('should return empty array when API fails', async () => {
      mockGetRandomPosts.mockResolvedValueOnce([]);

      const result = await loader();

      expect(result).toEqual([]);
    });
  });

  describe('Home Component', () => {
    const mockPosts = createMockPosts(3);

    beforeEach(() => {
      mockUseLoaderData.mockReturnValue(mockPosts);
    });

    it('should render the header with SIM-FEED branding', () => {
      render(<Home />);

      expect(screen.getByText('SIM-FEED')).toBeInTheDocument();
    });

    it('should render the hero section with main heading', () => {
      render(<Home />);

      expect(screen.getByText('Political Satire Meets AI')).toBeInTheDocument();
    });

    it('should render the hero description', () => {
      render(<Home />);

      expect(
        screen.getByText(/Experience a social feed powered by AI agents/i)
      ).toBeInTheDocument();
    });

    it('should render View Feed and Learn More buttons', () => {
      render(<Home />);

      const viewFeedLink = screen.getByRole('link', { name: /view feed/i });
      const learnMoreLink = screen.getByRole('link', { name: /learn more/i });

      expect(viewFeedLink).toHaveAttribute('href', '/feed');
      expect(learnMoreLink).toHaveAttribute(
        'href',
        'https://github.com/argel6767/sim-feed#readme'
      );
    });

    it('should render all three feature sections', () => {
      render(<Home />);

      expect(screen.getByText('AI Agents')).toBeInTheDocument();
      expect(screen.getByText('Political Caricatures')).toBeInTheDocument();
      expect(screen.getByText('Social Theater')).toBeInTheDocument();
    });

    it('should render feature descriptions', () => {
      render(<Home />);

      expect(
        screen.getByText(/Autonomous AI entities with distinct political perspectives/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Each agent embodies an exaggerated version of a political ideology/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Experience political discourse reimagined as pure entertainment/i)
      ).toBeInTheDocument();
    });

    it('should render the preview section with heading', () => {
      render(<Home />);

      expect(screen.getByText('See It In Action')).toBeInTheDocument();
    });

    it('should render posts from loader data', () => {
      render(<Home />);

      // Check that each post's author username is rendered
      mockPosts.forEach((post) => {
        expect(screen.getByText(post.author_username)).toBeInTheDocument();
      });
    });

    it('should render post content (shortened if too long)', () => {
      const longPost = createMockPost({
        id: 99,
        body: 'A'.repeat(350), // Longer than 300 chars
        author_username: 'LongPostAgent',
      });
      mockUseLoaderData.mockReturnValue([longPost]);

      render(<Home />);

      // Body should be truncated to 300 chars + '...'
      const truncatedText = 'A'.repeat(300) + '...';
      expect(screen.getByText(truncatedText)).toBeInTheDocument();
    });

    it('should render post interaction counts', () => {
      const testPost = createMockPost({
        id: 1,
        comments_count: 5,
        likes_count: 10,
        author_username: 'TestUser',
      });
      mockUseLoaderData.mockReturnValue([testPost]);

      render(<Home />);

      expect(screen.getByText('💬 5')).toBeInTheDocument();
      expect(screen.getByText('❤️ 10')).toBeInTheDocument();
    });

    it('should render Read More links for each post', () => {
      render(<Home />);

      const readMoreLinks = screen.getAllByRole('link', { name: /read more/i });
      expect(readMoreLinks).toHaveLength(mockPosts.length);

      mockPosts.forEach((post, index) => {
        expect(readMoreLinks[index]).toHaveAttribute('href', `/posts/${post.id}`);
      });
    });

    it('should render the footer', () => {
      render(<Home />);

      expect(
        screen.getByText(/© 2025 Sim Feed. Political Satire Platform./i)
      ).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(<Home />);

      expect(screen.getByRole('link', { name: /features/i })).toHaveAttribute(
        'href',
        '#features'
      );
      expect(screen.getByRole('link', { name: /preview/i })).toHaveAttribute(
        'href',
        '#preview'
      );
      expect(screen.getByRole('link', { name: /view source code/i })).toHaveAttribute(
        'href',
        'https://github.com/argel6767/sim-feed'
      );
    });

    it('should render Agent badges for each post', () => {
      render(<Home />);

      const agentBadges = screen.getAllByText('Agent');
      expect(agentBadges).toHaveLength(mockPosts.length);
    });

    it('should render avatar initials for each post', () => {
      const posts = [
        createMockPost({ id: 1, author_username: 'AlphaAgent' }),
        createMockPost({ id: 2, author_username: 'BetaBot' }),
      ];
      mockUseLoaderData.mockReturnValue(posts);

      render(<Home />);

      // First letter of username, uppercased
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('should handle empty posts array gracefully', () => {
      mockUseLoaderData.mockReturnValue([]);

      render(<Home />);

      // Should still render the page structure
      expect(screen.getByText('SIM-FEED')).toBeInTheDocument();
      expect(screen.getByText('See It In Action')).toBeInTheDocument();

      // No Read More links should be present
      expect(screen.queryAllByRole('link', { name: /read more/i })).toHaveLength(0);
    });
  });

  describe('Feature Component', () => {
    it('should render features with proper structure', () => {
      mockUseLoaderData.mockReturnValue([]);

      render(<Home />);

      // Each feature should have a heading (h3) and description
      const featureHeadings = ['AI Agents', 'Political Caricatures', 'Social Theater'];

      featureHeadings.forEach((heading) => {
        const headingElement = screen.getByText(heading);
        expect(headingElement.tagName).toBe('H3');
      });
    });
  });
});
