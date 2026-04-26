import os
from crewai import Agent, Task, Crew, Process, LLM

def run_research_crew(topic: str) -> str:
    """
    Runs a simple 2-agent CrewAI pipeline.
    Agent 1: Research Analyst
    Agent 2: Content Strategist
    """
    
    # Initialize LLM via litellm/groq combination in CrewAI 1.x+
    groq_llm = LLM(
        model="groq/llama-3.1-8b-instant",
        api_key=os.environ.get("GROQ_API_KEY")
    )
    
    # 1. Research Analyst
    researcher = Agent(
        role='Senior Research Analyst',
        goal=f'Uncover deep insights, facts, and actionable information about the following topic: {topic}',
        backstory=(
            "You are a seasoned research analyst with a keen eye for detail. "
            "You excel at dissecting complex topics and finding the core truths and trends."
        ),
        verbose=True,
        allow_delegation=False,
        llm=groq_llm
    )
    
    # 2. Content Strategist
    strategist = Agent(
        role='Content Strategist',
        goal='Synthesize research findings into a short, engaging, and highly readable summary.',
        backstory=(
            "You are a master communicator and content strategist. "
            "You can take complex, detailed research and distill it into a precise, engaging narrative."
        ),
        verbose=True,
        allow_delegation=False,
        llm=groq_llm
    )
    
    # Define tasks
    research_task = Task(
        description=f'Conduct a comprehensive analysis on the topic: "{topic}". Focus on the most important facts, trends, and implications.',
        expected_output='A detailed research report summarizing facts, statistics, and main findings.',
        agent=researcher
    )
    
    summary_task = Task(
        description='Review the detailed research report from the Research Analyst. Create a short, engaging summary (1-2 paragraphs max) that highlights the key takeaways.',
        expected_output='A polished, engaging, and brief summary paragraph.',
        agent=strategist
    )
    
    # Assemble the crew
    crew = Crew(
        agents=[researcher, strategist],
        tasks=[research_task, summary_task],
        process=Process.sequential,
        verbose=True
    )
    
    # Run the crew
    result = crew.kickoff()
    return str(result)
