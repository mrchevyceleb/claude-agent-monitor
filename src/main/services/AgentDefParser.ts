import { promises as fs } from 'fs'
import { join, basename } from 'path'
import matter from 'gray-matter'
import { getAgentsDir } from '../utils/paths'
import { logger } from '../utils/logger'

/**
 * Parse an agent definition file (Markdown with YAML frontmatter)
 */
export async function parseAgentDef(filepath: string): Promise<AgentDefinition | null> {
  try {
    const content = await fs.readFile(filepath, 'utf-8')
    const { data, content: body } = matter(content)

    return {
      name: data.name || basename(filepath, '.md'),
      description: data.description || '',
      model: data.model || 'haiku',
      color: data.color || 'gray',
      instructions: body.trim(),
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      logger.error('Error parsing agent definition:', err.message)
    }
    return null
  }
}

/**
 * Discover all agent definition files
 */
export async function discoverAgentDefs(): Promise<Map<string, AgentDefinition>> {
  const agentsDir = getAgentsDir()
  const result = new Map<string, AgentDefinition>()

  try {
    const files = await fs.readdir(agentsDir)
    const mdFiles = files.filter((f) => f.endsWith('.md'))

    for (const file of mdFiles) {
      const filepath = join(agentsDir, file)
      const def = await parseAgentDef(filepath)
      if (def) {
        result.set(def.name, def)
      }
    }
  } catch (err: any) {
    if (err.code !== 'ENOENT') {
      logger.error('Error discovering agent definitions:', err.message)
    }
  }

  return result
}

/**
 * Get a specific agent definition by name
 */
export async function getAgentDef(name: string): Promise<AgentDefinition | null> {
  const filepath = join(getAgentsDir(), `${name}.md`)
  return parseAgentDef(filepath)
}

/**
 * Color mapping for agent types
 */
export const AGENT_COLORS: Record<string, string> = {
  blue: '#58a6ff',
  green: '#3fb950',
  yellow: '#d29922',
  red: '#f85149',
  purple: '#a371f7',
  orange: '#db6d28',
  gray: '#8b949e',
}

export function getAgentColor(colorName: string): string {
  return AGENT_COLORS[colorName] || AGENT_COLORS.gray
}
