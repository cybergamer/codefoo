import java.util.Scanner;

public class Plates {
	public static void main(String[] args) {	
		
		System.out.println("Enter a population size:");
		Scanner console = new Scanner(System.in);
		long population_size = console.nextLong();
		
		Pattern bestPattern = recurse(population_size, 1);
		
		System.out.println("Excess Plates: " + bestPattern.excessPlates + " (" + bestPattern.percent + "%)");
		System.out.println("Pattern: " + bestPattern.pattern.toString());
		
	}
	
	private static Pattern recurse(long requiredPlates, long plateCount) {	

		if(plateCount >= requiredPlates) {
			return new Pattern(requiredPlates, plateCount);
		}
		
		/* Split Patterns
		 * We assume that there are 10 possibilities for numbers (0-9)
		 * and 26 possibilities for letters, (a-z);
		 */
		Pattern pattern_one = recurse(requiredPlates, plateCount*10);
		Pattern pattern_two = recurse(requiredPlates, plateCount*26);
		
		if(pattern_one.excessPlates < pattern_two.excessPlates) {
			pattern_one.pattern.add("number");
			return pattern_one;
		}
		
		pattern_two.pattern.add("letter");
		return pattern_two;
	}
}
