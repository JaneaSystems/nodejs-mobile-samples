//
//  ViewController.m
//  native-xcode
//
//  Created by Jaime Bernardo on 29/09/2017.
//  Copyright © 2017 Janea Systems. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()
@property (weak, nonatomic) IBOutlet UIButton *myButton;
@property (weak, nonatomic) IBOutlet UITextView *myTextView;

- (IBAction)myButtonAction:(id)sender;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
}

- (IBAction)myButtonAction:(id)sender
{
    NSString *localNodeServerURL = @"http:/127.0.0.1:3000/";
    NSURL  *url = [NSURL URLWithString:localNodeServerURL];
    NSString *versionsData = [NSString stringWithContentsOfURL:url];
    if (versionsData)
    {
        [_myTextView setText:versionsData];
    }
    
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


@end
